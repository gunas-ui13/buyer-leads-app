import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// CSV validation schema
type ValidationRule = {
  required: boolean;
  type: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  values?: string[];
};
const CSVRowSchema: Record<string, ValidationRule> = {
  fullName: { required: true, type: 'string', minLength: 2, maxLength: 80 },
  email: { required: false, type: 'email' },
  phone: { required: true, type: 'string', minLength: 10, maxLength: 15 },
  city: { required: true, type: 'enum', values: ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'] },
  propertyType: { required: true, type: 'enum', values: ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'] },
  bhk: { required: false, type: 'enum', values: ['One', 'Two', 'Three', 'Four', 'Studio'] },
  purpose: { required: true, type: 'enum', values: ['Buy', 'Rent'] },
  budgetMin: { required: false, type: 'number', min: 0 },
  budgetMax: { required: false, type: 'number', min: 0 },
  timeline: { required: true, type: 'enum', values: ['T0_3m', 'T3_6m', 'T6m_plus', 'Exploring'] },
  source: { required: true, type: 'enum', values: ['Website', 'Referral', 'Walk_in', 'Call', 'Other'] },
  status: { required: false, type: 'enum', values: ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'] },
  notes: { required: false, type: 'string', maxLength: 1000 },
  tags: { required: false, type: 'string' }
};

function validateCSVRow(row: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  Object.entries(CSVRowSchema).forEach(([field, rules]) => {
    const value = row[field];
    
    if (rules.required && (!value || value.trim() === '')) {
      errors.push(`${field} is required`);
      return;
    }

    if (value && value.trim() !== '') {
      // Type validation
      if (rules.type === 'string') {
        if (typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        } else if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        } else if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be less than ${rules.maxLength} characters`);
        }
      } else if (rules.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field} must be a valid email address`);
        }
      } else if (rules.type === 'number') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors.push(`${field} must be a valid number`);
        } else if (rules.min !== undefined && numValue < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
      } else if (rules.type === 'enum') {
  if (!rules.values) return; // <-- stop if values are undefined
  if (!rules.values.includes(value)) {
    errors.push(`${field} must be one of: ${rules.values.join(', ')}`);
  }
}

    }
  });

  // Custom validation for budget
  if (row.budgetMin && row.budgetMax) {
    const minBudget = parseFloat(row.budgetMin);
    const maxBudget = parseFloat(row.budgetMax);
    if (!isNaN(minBudget) && !isNaN(maxBudget) && maxBudget < minBudget) {
      errors.push('Maximum budget must be greater than or equal to minimum budget');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
      });
      return row;
    });

    // Validate rows
    const validationResults = rows.map((row, index) => ({
      rowIndex: index + 2, // +2 because we skip header and arrays are 0-indexed
      ...validateCSVRow(row),
      data: row
    }));

    const validRows = validationResults.filter(result => result.isValid);
    const invalidRows = validationResults.filter(result => !result.isValid);

    if (validRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid rows found',
        errors: invalidRows.map(row => ({
          row: row.rowIndex,
          errors: row.errors
        }))
      }, { status: 400 });
    }

    // Import valid rows in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const importedLeads = [];
      
      for (const result of validRows) {
        const lead = await tx.buyer.create({
          data: {
            fullName: result.data.fullname,
            email: result.data.email || null,
            phone: result.data.phone,
            city: result.data.city,
            propertyType: result.data.propertytype,
            bhk: result.data.bhk || null,
            purpose: result.data.purpose,
            budgetMin: result.data.budgetmin ? parseFloat(result.data.budgetmin) : null,
            budgetMax: result.data.budgetmax ? parseFloat(result.data.budgetmax) : null,
            timeline: result.data.timeline,
            source: result.data.source,
            status: result.data.status || 'New',
            notes: result.data.notes || null,
            tags: result.data.tags || null,
            ownerId: user.id
          }
        });

        // Create history entry
        await tx.buyerHistory.create({
          data: {
            buyerId: lead.id,
            changedBy: user.id,
            changedAt: new Date(),
            diff: { action: 'created', fields: ['fullName', 'phone', 'city', 'propertyType', 'purpose'] }
          }
        });

        importedLeads.push(lead);
      }

      return importedLeads;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${results.length} leads`,
      imported: results.length,
      total: rows.length,
      errors: invalidRows.map(row => ({
        row: row.rowIndex,
        errors: row.errors
      }))
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}

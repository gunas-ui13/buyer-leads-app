# Buyer Leads Management App

A modern, full-featured buyer leads management system built with Next.js, TypeScript, and Prisma. This application allows real estate professionals to capture, manage, and track property buyer leads with advanced filtering, search, and CSV import/export capabilities.

## 🚀 Features

### Core Functionality
- **Lead Management**: Create, view, edit, and delete buyer leads
- **Advanced Search & Filtering**: Search by name, phone, email with filters for city, property type, status, and timeline
- **Role-Based Access**: Separate user and admin roles with different permissions
- **CSV Import/Export**: Bulk import leads and export filtered data
- **Real-time Dashboard**: Live statistics and recent leads overview
- **Responsive Design**: Beautiful, modern UI that works on all devices

### Technical Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Prisma ORM** with SQLite database
- **Zod** for form validation
- **React Hook Form** for form management
- **Tailwind CSS** for styling
- **File-based authentication** (demo purposes)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Validation**: Zod
- **Forms**: React Hook Form
- **Authentication**: Custom cookie-based auth

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd buyer-leads-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="file:./database.db"
```

### 4. Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔐 Authentication

### Admin Login
- **Email**: `admin@example.com`
- **Password**: `123456`
- **Access**: Full system access, can view and manage all leads

### User Registration
- Users can register with their own email and password
- Users can only view and manage their own leads
- Visit `/register` to create a new user account

## 📊 Data Model

### Buyer Lead Fields
- **Personal**: Full Name, Email, Phone
- **Location**: City (Chandigarh, Mohali, Zirakpur, Panchkula, Other)
- **Property**: Type (Apartment, Villa, Plot, Office, Retail), BHK
- **Requirements**: Purpose (Buy/Rent), Budget Range, Timeline
- **Tracking**: Source, Status, Notes, Tags
- **System**: Owner ID, Created/Updated timestamps

### Status Options
- New → Qualified → Contacted → Visited → Negotiation → Converted/Dropped

## 🎯 Usage

### For Users
1. **Register** a new account or login
2. **Create leads** using the "Add New Lead" form
3. **View all leads** with search and filtering
4. **Export data** to CSV for external use
5. **Import leads** from CSV files

### For Admins
1. **Login** with admin credentials
2. **View all leads** from all users
3. **Export complete data** including all user leads
4. **Manage system** with full access

## 📁 Project Structure

```
buyer-leads-app/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   └── buyers/         # Buyer CRUD operations
│   ├── buyers/             # Buyer management pages
│   ├── components/         # Reusable components
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── page.tsx            # Dashboard
├── lib/
│   ├── auth.ts             # Authentication logic
│   ├── prisma.ts           # Database client
│   ├── stats.ts            # Dashboard statistics
│   └── users.json          # User storage (demo)
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### Buyers
- `GET /api/buyers` - List buyers (with pagination/filters)
- `POST /api/buyers` - Create new buyer
- `GET /api/buyers/export` - Export buyers as CSV
- `POST /api/buyers/import` - Import buyers from CSV

## 📈 CSV Import/Export

### Export
- Exports current filtered view
- Includes all lead data
- Role-based: users see only their leads, admins see all

### Import
- Validates data according to schema
- Shows detailed error messages
- Only imports valid rows
- Creates history entries

### CSV Template
Download the template to see the required format:
- Full Name, Email, Phone, City, Property Type, BHK
- Purpose, Min Budget, Max Budget, Timeline, Source
- Status, Notes, Tags

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js
   - Add environment variable: `DATABASE_URL="file:./database.db"`
   - Deploy!

### Environment Variables for Production
```env
DATABASE_URL="file:./database.db"
NODE_ENV="production"
```

## 🛡️ Security Notes

- This is a demo application with file-based authentication
- For production, implement proper password hashing
- Use a real database (PostgreSQL, MySQL) instead of SQLite
- Implement proper session management
- Add rate limiting and input sanitization

## 🐛 Troubleshooting

### Common Issues

1. **Database not found**: Run `npx prisma db push`
2. **Authentication errors**: Check if user exists in `lib/users.json`
3. **CSV import fails**: Ensure CSV format matches template
4. **Build errors**: Run `npx prisma generate`

### Development Commands
```bash
# Database operations
npx prisma db push          # Apply schema changes
npx prisma generate         # Generate Prisma client
npx prisma studio          # Open database GUI

# Development
npm run dev                # Start development server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**
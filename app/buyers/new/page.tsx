"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ✅ Define schema
const BuyerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(80, "Full name must be less than 80 characters"),
    email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Please enter a valid email address"
    }),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be less than 15 digits"),
    city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"], {
      message: "Please select a city"
    }),
    propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"], {
      message: "Please select a property type"
    }),
    bhk: z.enum(["One", "Two", "Three", "Four", "Studio"]).optional(),
    purpose: z.enum(["Buy", "Rent"], {
      message: "Please select a purpose"
    }),
    budgetMin: z.coerce.number().min(0, "Budget must be positive").optional(),
    budgetMax: z.coerce.number().min(0, "Budget must be positive").optional(),
    timeline: z.enum(["T0_3m", "T3_6m", "T6m_plus", "Exploring"], {
      message: "Please select a timeline"
    }),
    source: z.enum(["Website", "Referral", "Walk_in", "Call", "Other"], {
      message: "Please select a source"
    }),
    notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
    tags: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only validate if both values are provided and not empty
      if (!data.budgetMin || !data.budgetMax) return true;
      return data.budgetMax >= data.budgetMin;
    },
    { 
      message: "Maximum budget must be greater than or equal to minimum budget", 
      path: ["budgetMax"] 
    }
  );

// ✅ Infer type from schema
type BuyerForm = z.infer<typeof BuyerSchema>;

export default function NewBuyerPage() {
  // ✅ Fix: use BuyerSchema (capital B)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerForm>({
    resolver: zodResolver(BuyerSchema),
  });

  const onSubmit = async (data: BuyerForm) => {
    try {
      // Clean up the data before sending
      const cleanData = {
        ...data,
        email: data.email || undefined, // Convert empty string to undefined
        budgetMin: data.budgetMin || undefined,
        budgetMax: data.budgetMax || undefined,
        notes: data.notes || undefined,
        tags: data.tags || undefined,
      };

    const res = await fetch("/api/buyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
    });
      
    if (res.ok) {
        alert("✅ Buyer lead saved successfully!");
        // Reset form after successful submission
        window.location.href = "/";
    } else {
        const errorData = await res.json();
        alert(`❌ Error saving buyer: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("❌ Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <style jsx>{`
        select option {
          background-color: white;
          color: #1e293b;
        }
        select:focus option {
          background-color: #f8fafc;
          color: #1e293b;
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Create New Buyer Lead
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Add a new property buyer lead to your database with detailed information
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
        <input
                    placeholder="Enter full name"
          {...register("fullName")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 placeholder-slate-500"
        />
        {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
        <input
                    type="email"
                    placeholder="Enter email address"
          {...register("email")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 placeholder-slate-500"
        />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
        <input
                    type="tel"
                    placeholder="Enter phone number"
          {...register("phone")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 placeholder-slate-500"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Preferences */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                Property Preferences
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">City *</label>
                  <select {...register("city")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800">
                    <option value="">Select City</option>
          <option value="Chandigarh">Chandigarh</option>
          <option value="Mohali">Mohali</option>
          <option value="Zirakpur">Zirakpur</option>
          <option value="Panchkula">Panchkula</option>
          <option value="Other">Other</option>
        </select>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Property Type *</label>
                  <select {...register("propertyType")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800">
                    <option value="">Select Property Type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot</option>
                    <option value="Office">Office</option>
                    <option value="Retail">Retail</option>
                  </select>
                  {errors.propertyType && (
                    <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">BHK</label>
                  <select {...register("bhk")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800">
                    <option value="">Select BHK</option>
                    <option value="Studio">Studio</option>
                    <option value="One">1 BHK</option>
                    <option value="Two">2 BHK</option>
                    <option value="Three">3 BHK</option>
                    <option value="Four">4 BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose *</label>
                  <select {...register("purpose")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800">
                    <option value="">Select Purpose</option>
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                  {errors.purpose && (
                    <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                Budget & Timeline
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Min Budget (₹)</label>
                   <input
                     type="number"
                     placeholder="e.g., 5000000"
                     {...register("budgetMin")}
                     className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 placeholder-slate-500"
                   />
                   <p className="text-xs text-slate-500 mt-1">Optional - minimum budget range</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Max Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 10000000"
                    {...register("budgetMax")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 placeholder-slate-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Optional - must be ≥ min budget if both provided</p>
                  {errors.budgetMax && (
                    <p className="text-red-500 text-sm mt-1">{errors.budgetMax.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Timeline *</label>
                  <select {...register("timeline")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800">
                    <option value="">Select Timeline</option>
                    <option value="T0_3m">0-3 months</option>
                    <option value="T3_6m">3-6 months</option>
                    <option value="T6m_plus">6+ months</option>
                    <option value="Exploring">Just exploring</option>
                  </select>
                  {errors.timeline && (
                    <p className="text-red-500 text-sm mt-1">{errors.timeline.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Additional Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Source *</label>
                  <select {...register("source")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800">
                    <option value="">Select Source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk_in">Walk-in</option>
                    <option value="Call">Phone Call</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.source && (
                    <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
                  <input
                    placeholder="e.g., urgent, premium, first-time buyer"
                    {...register("tags")}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 placeholder-slate-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea
                    placeholder="Additional notes about the buyer..."
                    {...register("notes")}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-slate-800 placeholder-slate-500 resize-none"
                  />
                  {errors.notes && (
                    <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
        <button
          type="submit"
                className="group relative inline-flex items-center px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Buyer Lead
        </button>
            </div>
      </form>
        </div>
      </div>
    </div>
  );
}

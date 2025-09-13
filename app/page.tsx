import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { getLeadStats } from "@/lib/stats";
import CSVManager from "./components/CSVManager";

export default async function Home() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get real lead statistics
  const stats = await getLeadStats(user.id, user.role);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Buyer Leads
              </h1>
              <p className="text-slate-600 mt-2 text-lg">Manage your property buyer leads with style</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-slate-500">Welcome, {user.name}</span>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/buyers"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                View All Leads
              </Link>
              <Link
                href="/buyers/new"
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Lead
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Welcome to Your Lead Management Hub</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Track, manage, and convert your property buyer leads with our powerful dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">Total Leads</p>
                <p className="text-4xl font-bold text-slate-800">{stats.totalLeads}</p>
                <p className="text-sm text-green-600 mt-2">All time</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">Qualified</p>
                <p className="text-4xl font-bold text-slate-800">{stats.qualifiedLeads}</p>
                <p className="text-sm text-green-600 mt-2">Ready to convert</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">In Progress</p>
                <p className="text-4xl font-bold text-slate-800">{stats.inProgressLeads}</p>
                <p className="text-sm text-amber-600 mt-2">Active leads</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">Converted</p>
                <p className="text-4xl font-bold text-slate-800">{stats.convertedLeads}</p>
                <p className="text-sm text-purple-600 mt-2">Success stories</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* CSV Import/Export */}
        <div className="mb-12">
          <CSVManager />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/buyers/new"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 hover:border-blue-300 transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Add New Lead</h3>
                <p className="text-slate-600">Create a new buyer lead with detailed information</p>
              </div>
            </Link>

            <Link
              href="/buyers"
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 p-8 rounded-2xl border border-emerald-200 hover:border-emerald-300 transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">View All Leads</h3>
                <p className="text-slate-600">Browse and manage all your buyer leads</p>
              </div>
            </Link>

            <Link
              href="/buyers?status=New"
              className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-100 p-8 rounded-2xl border border-purple-200 hover:border-purple-300 transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">New Leads</h3>
                <p className="text-slate-600">View all new leads that need attention</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50">
            <h2 className="text-2xl font-bold text-slate-800">Recent Leads</h2>
          </div>
          <div className="p-8">
            {stats.recentLeads.length > 0 ? (
              <div className="space-y-4">
                {stats.recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-slate-200/50 hover:bg-white/70 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {lead.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{lead.fullName}</h3>
                        <p className="text-sm text-slate-600">{lead.email || lead.phone}</p>
                        <p className="text-xs text-slate-500">{lead.city} • {lead.propertyType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                        lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'Visited' ? 'bg-orange-100 text-orange-800' :
                        lead.status === 'Negotiation' ? 'bg-purple-100 text-purple-800' :
                        lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lead.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(lead.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Link
                    href="/buyers"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Leads →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No leads yet</h3>
                <p className="text-slate-600 mb-8 text-lg max-w-md mx-auto">
                  Get started by adding your first buyer lead and watch your dashboard come to life!
                </p>
                <Link
                  href="/buyers/new"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Lead
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

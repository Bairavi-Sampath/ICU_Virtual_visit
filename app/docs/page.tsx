'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Code, FileJson } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">API Documentation</h1>
          <p className="text-xl text-slate-300">
            Complete API reference for ICU Virtual Visit platform
          </p>
        </div>

        {/* Main Docs Links */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {/* Swagger UI */}
          <Link href="/docs/swagger">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Interactive API</h3>
              <p className="text-slate-300">
                Explore all endpoints with Swagger UI. Test requests and see responses in real-time.
              </p>
            </div>
          </Link>

          {/* Endpoints Reference */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <FileJson className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">API Endpoints</h3>
            <p className="text-slate-300">
              View all available endpoints and their specifications.
            </p>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Reference</h2>
            
            <div className="space-y-6">
              {/* Patients */}
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3">Patients</h3>
                <div className="space-y-2 text-slate-300 font-mono text-sm">
                  <div className="bg-slate-900/50 p-3 rounded border-l-2 border-green-400">
                    <span className="text-blue-400">GET</span> /api/patients
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded border-l-2 border-green-400">
                    <span className="text-blue-400">GET</span> /api/patients/&lt;patientId&gt;
                  </div>
                </div>
              </div>

              {/* Calls */}
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Video Calls</h3>
                <div className="space-y-2 text-slate-300 font-mono text-sm">
                  <div className="bg-slate-900/50 p-3 rounded border-l-2 border-purple-400">
                    <span className="text-green-400">POST</span> /api/patients/&lt;patientId&gt;/call
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded border-l-2 border-purple-400">
                    <span className="text-red-400">DELETE</span> /api/patients/&lt;patientId&gt;/call
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Scheduling</h3>
                <div className="space-y-2 text-slate-300 font-mono text-sm">
                  <div className="bg-slate-900/50 p-3 rounded border-l-2 border-yellow-400">
                    <span className="text-green-400">POST</span> /api/patients/&lt;patientId&gt;/schedule
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Notes</h3>
                <div className="space-y-2 text-slate-300 font-mono text-sm">
                  <div className="bg-slate-900/50 p-3 rounded border-l-2 border-cyan-400">
                    <span className="text-green-400">GET</span> /api/patients/&lt;patientId&gt;/notes
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded border-l-2 border-cyan-400">
                    <span className="text-green-400">POST</span> /api/patients/&lt;patientId&gt;/notes
                  </div>
                </div>
              </div>

              {/* Database */}
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-3">Database</h3>
                <div className="space-y-2 text-slate-300 font-mono text-sm">
                  <div className="bg-slate-900/50 p-3 rounded border-l-2 border-orange-400">
                    <span className="text-blue-400">GET</span> /api/db/ping
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-slate-900">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Auto-complete Ended Calls</h4>
                  <p className="text-sm text-slate-300">Calls automatically marked as completed after scheduled time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-slate-900">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Real-time Patient Status</h4>
                  <p className="text-sm text-slate-300">Live updates on patient health status and call status</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-slate-900">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Instant Video Calls</h4>
                  <p className="text-sm text-slate-300">Powered by Talky.io - no login or moderator required</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-slate-900">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Secure Authentication</h4>
                  <p className="text-sm text-slate-300">Role-based access for nurses, families, and staff</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

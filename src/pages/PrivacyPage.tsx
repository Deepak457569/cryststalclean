import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-cream-200 pb-6">
        <span className="text-xs uppercase tracking-widest font-semibold text-champagne-700">Legal &amp; Compliance</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">Privacy Policy</h1>
        <p className="text-xs text-charcoal-800">Last updated: October 2026</p>
      </div>

      <div className="prose prose-sm text-charcoal-800 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">1. Overview and Business Context</h2>
          <p>
            CryststalClean operates as a B2B hospitality amenities supplier. This Privacy Policy outlines our standards regarding data collection, confidentiality, and data handling when clients access our website, configure requirement carts, and submit trade inquiries.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">2. Information Collected</h2>
          <p>
            We collect information provided directly by hospitality clients, including contact person name, hotel or company name, business phone number, email address, delivery city, and product selection requirements. We do not store sensitive payment card information on this website as transactions and contracts are finalized through formal B2B invoicing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">3. Customer Access Code System</h2>
          <p>
            Access codes are issued to verified hotel buyers and purchasing managers to safeguard wholesale pricing and prevent automated web scraping or spam submissions. Usage count and timestamps are maintained to enforce authorization limits and secure supply agreements. Plaintext codes are not retained in public web cookies or client-accessible scripts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">4. Direct Procurement Communications</h2>
          <p>
            When submitting requirements, client procurement requests and contact details are logged directly into our secure executive database for internal fulfillment, quotation calculation, and direct order communication.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">5. Data Confidentiality &amp; Security</h2>
          <p>
            All submitted inquiries and client records are stored securely in Cloudflare D1 encrypted databases. We do not sell, rent, or trade client commercial data to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">6. Inquiries and Contact</h2>
          <p>
            For privacy inquiries or data update requests, please contact our administrative desk at{' '}
            <a href="mailto:orders@crystalclean.in" className="text-champagne-700 underline font-semibold">
              orders@crystalclean.in
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};

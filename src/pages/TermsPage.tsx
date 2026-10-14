import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-cream-200 pb-6">
        <span className="text-xs uppercase tracking-widest font-semibold text-champagne-700">Commercial Agreement</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">Terms and Conditions of Supply</h1>
        <p className="text-xs text-charcoal-800">Effective: October 2026</p>
      </div>

      <div className="prose prose-sm text-charcoal-800 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">1. Commercial Trade Basis</h2>
          <p>
            CryststalClean supplies commercial hotel amenities, guest personal care items, and room accessories exclusively for trade and business purchasers (Hotels, Resorts, Guest Houses, Homestays, Serviced Apartments, and Institutions). We do not operate a direct-to-consumer retail shop.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">2. Absence of Public Pricing</h2>
          <p>
            No product prices, discounts, taxes, or total costs are published on this website. Commercial quotations, minimum order quantities (MOQ), volume price tiers, payment terms, and freight charges are quoted individually based on client order volumes and customized branding specifications.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">3. Nature of Website Inquiries</h2>
          <p>
            Submission of a requirements cart or bulk quotation form does not constitute a confirmed or binding contract of sale. Confirmation takes place following review, quotation approval, and issuance of a proforma invoice or purchase order through our authorized sales representatives.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">4. Customer Access Code Terms</h2>
          <p>
            Access codes are non-transferable and issued solely to designated client representatives. CryststalClean reserves the right to suspend, revoke, or regenerate access codes upon evidence of unauthorized sharing, automated bot activity, or commercial misuse.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">5. Custom Hotel Branding &amp; Monograms</h2>
          <p>
            Where custom hotel logos or crests are applied to amenities, the client warrants that they hold lawful proprietary rights or licensing authority for the submitted artwork. Plate charges and customized proof approvals are agreed upon prior to final print runs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">6. Dispatch &amp; Delivery</h2>
          <p>
            Dispatch schedules are subject to batch production timelines and freight logistics across India. Inspection of goods must occur upon delivery, and claims regarding damage or transit discrepancy should be registered within 48 hours.
          </p>
        </section>
      </div>
    </div>
  );
};

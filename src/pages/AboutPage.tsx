import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Leaf, Sparkles, Building2, CheckCircle2, Award, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Header */}
      <section className="bg-cream-100/70 border-b border-cream-200 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-champagne-700">About Us</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal-900 leading-tight">
            Elevating Hotel Guest Experiences Across India
          </h1>
          <p className="text-base text-charcoal-800 leading-relaxed">
            CrystalClean is a specialized hospitality amenities manufacturer and wholesale supplier, partnering with luxury hotels, resorts, boutique properties, and hospitality chains nationwide.
          </p>
        </div>
      </section>

      {/* Core Mission & Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-champagne-700">Our Standards</span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">
              Formulated for Luxury. Packaged for Responsibility.
            </h2>
            <p className="text-sm text-charcoal-800 leading-relaxed">
              Every detail in a hotel bathroom shapes a guest's perception of luxury. Our shampoos, conditioners, body washes, and botanical lotions are crafted with skin-kind ingredients, paraben-free formulas, and long-lasting fragrances.
            </p>
            <p className="text-sm text-charcoal-800 leading-relaxed">
              We lead the shift toward eco-responsible hospitality with biodegradable bamboo dental kits, cornstarch accessories, and 5-litre institutional refill gallons that eliminate single-use plastic waste.
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-charcoal-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero animal testing &amp; dermatologist-tested formulations</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-charcoal-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>FSC-certified kraft paper packaging and biodegradable wheat straw plastics</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-charcoal-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Custom logo embossing and hot-stamping on bulk batches</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
                alt="Hotel Suite Amenities"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-charcoal-900 text-white p-6 rounded-2xl shadow-xl max-w-xs border border-charcoal-800">
              <p className="font-serif font-bold text-lg text-champagne-300">Dedicated B2B Desk</p>
              <p className="text-xs text-cream-200 mt-1">Direct communication, tailored wholesale pricing, and guaranteed dispatch schedules.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-white py-16 border-y border-cream-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-semibold text-champagne-700">Why CrystalClean</span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">Our Core Commitments</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-champagne-100 text-champagne-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-charcoal-900">Hospitality Exclusive</h3>
              <p className="text-xs text-charcoal-800 leading-relaxed">
                We supply strictly to verified hotels and resorts. Our pricing structure protects your margins without retail channel interference.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-champagne-100 text-champagne-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-charcoal-900">Custom Branding</h3>
              <p className="text-xs text-charcoal-800 leading-relaxed">
                Seamless brand integration: we print or foil-stamp your hotel's crest and colors directly onto amenity packaging, boxes, and slippers.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-champagne-100 text-champagne-700 flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-charcoal-900">Sustainable Solutions</h3>
              <p className="text-xs text-charcoal-800 leading-relaxed">
                Help your property meet ESG benchmarks with our certified eco bamboo toothbrush handles, organic cotton vanity sets, and recyclable pump dispensers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-serif text-3xl font-bold text-charcoal-900">Ready to Partner with CrystalClean?</h2>
        <p className="text-sm text-charcoal-800 max-w-lg mx-auto">
          Contact our hospitality procurement desk to request an authorized access code and customized quotations for your property.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/quote"
            className="px-6 py-3.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium rounded-xl text-sm transition-all"
          >
            Request Bulk Quotation
          </Link>
          <a
            href="https://wa.me/919149953610"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-medium rounded-xl text-sm transition-all"
          >
            WhatsApp Hotline
          </a>
        </div>
      </section>
    </div>
  );
};

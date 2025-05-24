import React from 'react';

function AboutUsPage() {
  return (
    <section className="py-12 px-6 bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">ABOUT US</h2>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://placehold.co/400x300/E0F2F7/000000?text=About+Us+Image"
              alt="About Us"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed">
                Welcome to HealPoint, your trusted partner in managing your healthcare needs conveniently and efficiently. At HealPoint,
                we understand that your health is your most valuable asset, and we're here to make managing it as simple as possible.
              </p>
              <p className="text-gray-600 leading-relaxed">
                HealPoint is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating
                cutting-edge features while maintaining the highest standards of security and privacy. Whether you're booking an
                appointment or managing ongoing care, HealPoint is here to support you every step of the way.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our vision at HealPoint is to create a seamless healthcare experience for every user. We aim to bridge the gap between
                patients and healthcare providers, making quality healthcare accessible to all.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">WHY CHOOSE US</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">EFFICIENCY:</h3>
            <p className="text-gray-600">
              Streamlined appointment scheduling that fits into your busy lifestyle.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">CONVENIENCE:</h3>
            <p className="text-gray-600">
              Access to a network of trusted healthcare professionals in your area.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">PERSONALIZATION:</h3>
            <p className="text-gray-600">
              Tailored recommendations and reminders to help you stay on top of your health.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUsPage; 
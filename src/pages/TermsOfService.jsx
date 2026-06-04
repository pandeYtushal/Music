import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex-1 bg-background text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft size={20} />
          <span>Back</span>
        </button>
        
        <h1 className="text-3xl md:text-5xl font-black mb-8 tracking-tight">Terms of Service</h1>
        
        <div className="space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Melody, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>
              Melody provides users with access to a rich collection of resources, including streaming audio content and personalized playlists. You understand and agree that the service is provided "AS-IS".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Conduct</h2>
            <p>
              You agree to not use the service to upload, post, email, transmit or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, or libelous.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Intellectual Property</h2>
            <p>
              All content included on the service, such as text, graphics, logos, images, audio clips, digital downloads, and software, is the property of Melody or its content suppliers and protected by international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

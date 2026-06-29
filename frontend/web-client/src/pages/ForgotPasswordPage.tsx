import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  const handleBlur = () => {
    setTouched(true);
  };

  const validateEmail = (val: string) => {
    if (!val) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const emailError = touched ? validateEmail(email) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);

    const validationMsg = validateEmail(email);
    if (validationMsg) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      // Success: Navigate to check-email with state
      navigate('/check-email', { state: { email } });
    } catch (err: any) {
      setError(err?.message || 'Unable to process reset request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col justify-between items-center py-12 px-4 font-sans selection:bg-legacy-gold/30 overflow-hidden">
      {/* Dynamic ambient backdrop to match exact soft vignette of screenshots */}
      <div className="absolute top-[-20%] left-[-10%] w-[550px] h-[550px] rounded-full bg-[#E2EAE7]/50 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#EAF0EE]/70 blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[5%] w-[450px] h-[450px] rounded-full bg-amber-500/[0.03] blur-[100px] pointer-events-none" />

      {/* Header section matching upper part of picture 1 */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center space-y-2 mt-4 z-10"
      >
        {/* Elegant Hand-crafted Dandelion Breeze Star logo as requested in Picture 2 */}
        <div className="mb-2 shrink-0">
          <svg className="w-36 h-36 mx-auto" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ambient shadow glow under the dandelion head */}
            <circle cx="170" cy="210" r="100" fill="url(#dandelion-glow)" opacity="0.15" />

            <defs>
              <radialGradient id="dandelion-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C59B27" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
              
              {/* Reusable seed cap for high performance and consistent aesthetic */}
              <g id="seed-cap-navy">
                <path d="M0,0 C-1.5,-3 -4,-5 -8,-6 M0,0 C-2,-4 -5,-7 -10,-8 M0,0 C-1,-5 -3,-8 -6,-11 M0,0 C0,-5 0,-9 0,-12 M0,0 C1,-5 3,-8 6,-11 M0,0 C2,-4 5,-7 10,-8 M0,0 C1.5,-3 4,-5 8,-6" stroke="#0D1F3D" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </g>
              <g id="seed-cap-gold">
                <path d="M0,0 C-1.5,-3 -4,-5 -8,-6 M0,0 C-2,-4 -5,-7 -10,-8 M0,0 C-1,-5 -3,-8 -6,-11 M0,0 C0,-5 0,-9 0,-12 M0,0 C1,-5 3,-8 6,-11 M0,0 C2,-4 5,-7 10,-8 M0,0 C1.5,-3 4,-5 8,-6" stroke="#C59B27" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </g>
            </defs>

            {/* CURVED BASE STEM (Navy Blue, flowing, elegant) */}
            <path d="M125 380 C130 340 142 290 170 210" stroke="#0D1F3D" strokeWidth="4" strokeLinecap="round" />

            {/* DEEP NAVY RECEPTACLE BASE WITH OVERLAPPING BRACTS (Picture 2 Leaf structure) */}
            <g fill="#0D1F3D">
              <path d="M170 210 C162 216 150 220 142 230 C154 226 164 218 170 210 Z" />
              <path d="M170 210 C166 218 158 232 150 242 C160 232 166 222 170 210 Z" />
              <path d="M170 210 C174 218 182 232 190 242 C180 232 174 222 170 210 Z" />
              <path d="M170 210 C178 216 190 220 198 230 C186 226 176 218 170 210 Z" />
            </g>

            {/* GOLDEN INNER FLORETS / PETAL CORES (In the center of Picture 2) */}
            <g fill="#C59B27">
              {/* Radiating central golden spots/petals */}
              <path d="M170 210 Q160 205 152 208 Q162 201 170 210 Z" />
              <path d="M170 210 Q165 195 160 190 Q170 195 170 210 Z" />
              <path d="M170 210 Q175 195 180 190 Q170 195 170 210 Z" />
              <path d="M170 210 Q180 205 188 208 Q178 201 170 210 Z" />
              <path d="M170 210 Q185 215 190 222 Q178 215 170 210 Z" />
              <path d="M170 210 Q155 215 150 222 Q162 215 170 210 Z" />

              {/* Smaller overlapping gold droplets */}
              <circle cx="170" cy="210" r="10" fill="#0D1F3D" />
              <circle cx="170" cy="210" r="6" fill="#C59B27" />
              <circle cx="164" cy="205" r="3.5" />
              <circle cx="176" cy="205" r="3.5" />
              <circle cx="170" cy="216" r="3.5" />
              <circle cx="160" cy="212" r="3" />
              <circle cx="180" cy="212" r="3" />
              <circle cx="170" cy="198" r="4" />
            </g>

            {/* MAIN PUFF SPHERE FILAMENTS AND CAPS (Radiating outward from 170, 210) */}
            <g stroke="#0D1F3D" strokeWidth="1.2">
              {/* Angle distribution to render a complete, high-density dandelion head */}
              {[
                { r: 85, a: 80 }, { r: 92, a: 95 }, { r: 88, a: 110 }, { r: 90, a: 125 },
                { r: 87, a: 140 }, { r: 82, a: 155 }, { r: 85, a: 170 }, { r: 80, a: 185 },
                { r: 82, a: 200 }, { r: 84, a: 215 }, { r: 80, a: 230 }, { r: 85, a: 245 },
                { r: 88, a: 260 }, { r: 90, a: 275 }, { r: 85, a: 290 }, { r: 92, a: 305 },
                { r: 87, a: 320 }, { r: 82, a: 335 }, { r: 75, a: 350 }, { r: 70, a: 5 },
                
                // Outer offset layer
                { r: 105, a: 88 }, { r: 108, a: 102 }, { r: 102, a: 118 }, { r: 105, a: 133 },
                { r: 100, a: 148 }, { r: 98, a: 163 }, { r: 102, a: 178 }, { r: 96, a: 193 },
                { r: 98, a: 208 }, { r: 100, a: 223 }, { r: 96, a: 238 }, { r: 102, a: 253 },
                { r: 105, a: 268 }, { r: 108, a: 283 }, { r: 102, a: 298 }, { r: 104, a: 313 },
                { r: 98, a: 328 }, { r: 90, a: 343 },
                
                // Dense inner volume layer (giving beautiful fullness)
                { r: 55, a: 10 }, { r: 60, a: 40 }, { r: 58, a: 70 }, { r: 52, a: 100 },
                { r: 55, a: 130 }, { r: 50, a: 160 }, { r: 52, a: 190 }, { r: 54, a: 220 },
                { r: 50, a: 250 }, { r: 55, a: 280 }, { r: 58, a: 310 }, { r: 62, a: 340 }
              ].map((filament, index) => {
                const rad = (filament.a * Math.PI) / 180;
                const endX = 170 + filament.r * Math.cos(rad);
                const endY = 210 + filament.r * Math.sin(rad);
                
                // Calculate rotation angle in degrees for the feathery caps so they always face outwards
                const capRotation = filament.a - 90;

                return (
                  <g key={index}>
                    {/* Filament stalk */}
                    <line x1="170" y1="210" x2={endX} y2={endY} />
                    {/* Custom feathery umbrella cap */}
                    <use 
                      href="#seed-cap-navy" 
                      x={endX} 
                      y={endY} 
                      transform={`rotate(${capRotation}, ${endX}, ${endY})`} 
                    />
                  </g>
                );
              })}
            </g>

            {/* FLOATING DETACHED PARACHUTE SEEDS SWEEPING UPWARDS & RIGHTWARDS */}
            {/* Seed 1 */}
            <g transform="translate(245, 175) rotate(-35)">
              <line x1="0" y1="22" x2="18" y2="0" stroke="#0D1F3D" strokeWidth="1.2" />
              <use href="#seed-cap-navy" x="18" y="0" transform="rotate(45, 18, 0)" />
              <circle cx="0" cy="22" r="1.5" fill="#C59B27" />
            </g>

            {/* Seed 2 */}
            <g transform="translate(285, 140) rotate(-45)">
              <line x1="0" y1="22" x2="18" y2="0" stroke="#0D1F3D" strokeWidth="1.2" />
              <use href="#seed-cap-navy" x="18" y="0" transform="rotate(45, 18, 0)" />
              <circle cx="0" cy="22" r="1.5" fill="#0D1F3D" />
            </g>

            {/* Seed 3 */}
            <g transform="translate(270, 95) rotate(-55)">
              <line x1="0" y1="25" x2="20" y2="0" stroke="#0D1F3D" strokeWidth="1.2" />
              <use href="#seed-cap-navy" x="20" y="0" transform="rotate(45, 20, 0)" />
              <circle cx="0" cy="25" r="1.5" fill="#C59B27" />
            </g>

            {/* Seed 4 */}
            <g transform="translate(320, 115) rotate(-40)">
              <line x1="0" y1="24" x2="19" y2="0" stroke="#0D1F3D" strokeWidth="1.2" />
              <use href="#seed-cap-navy" x="19" y="0" transform="rotate(40, 19, 0)" />
              <circle cx="0" cy="24" r="1.5" fill="#0D1F3D" />
            </g>

            {/* Seed 5 (high flying) */}
            <g transform="translate(315, 65) rotate(-60)">
              <line x1="0" y1="20" x2="16" y2="0" stroke="#0D1F3D" strokeWidth="1.2" />
              <use href="#seed-cap-navy" x="16" y="0" transform="rotate(30, 16, 0)" />
              <circle cx="0" cy="20" r="1.2" fill="#C59B27" />
            </g>

            {/* STARS AND CELESTIAL ELEMENTS (Shining gold stars from Picture 2) */}
            {/* Main Statement 5-Point Star (Top Right) */}
            <g transform="translate(355, 65) scale(1.6)">
              <path d="M 0,-10 L 2.5,-3 L 9.5,-3 L 4,-1 L 6,6 L 0,2 L -6,6 L -4,-1 L -9.5,-3 L -2.5,-3 Z" fill="#C59B27" />
            </g>

            {/* 5-Point Star 2 */}
            <g transform="translate(295, 110) scale(1.1)">
              <path d="M 0,-10 L 2.5,-3 L 9.5,-3 L 4,-1 L 6,6 L 0,2 L -6,6 L -4,-1 L -9.5,-3 L -2.5,-3 Z" fill="#C59B27" />
            </g>

            {/* 5-Point Star 3 */}
            <g transform="translate(350, 105) scale(1.0)">
              <path d="M 0,-10 L 2.5,-3 L 9.5,-3 L 4,-1 L 6,6 L 0,2 L -6,6 L -4,-1 L -9.5,-3 L -2.5,-3 Z" fill="#C59B27" />
            </g>

            {/* 4-Point Magic Sparkles (Floating amongst the seeds) */}
            {/* Sparkle 1 */}
            <g transform="translate(258, 205)">
              <path d="M0,-8 Q0,0 8,0 Q0,0 0,8 Q0,0 -8,0 Q0,0 0,-8 Z" fill="#C59B27" />
            </g>
            {/* Sparkle 2 */}
            <g transform="translate(312, 175)">
              <path d="M0,-6 Q0,0 6,0 Q0,0 0,6 Q0,0 -6,0 Q0,0 0,-6 Z" fill="#C59B27" />
            </g>
            {/* Sparkle 3 */}
            <g transform="translate(348, 140)">
              <path d="M0,-5 Q0,0 5,0 Q0,0 0,5 Q0,0 -5,0 Q0,0 0,-5 Z" fill="#C59B27" />
            </g>
            {/* Sparkle 4 */}
            <g transform="translate(281, 78)">
              <path d="M0,-4 Q0,0 4,0 Q0,0 0,4 Q0,0 -4,0 Q0,0 0,-4 Z" fill="#C59B27" />
            </g>
            {/* Sparkle 5 */}
            <g transform="translate(332, 45)">
              <path d="M0,-5 Q0,0 5,0 Q0,0 0,5 Q0,0 -5,0 Q0,0 0,-5 Z" fill="#C59B27" fillOpacity="0.8" />
            </g>

            {/* Tiny ambient glowing space dust */}
            <circle cx="218" cy="155" r="1.5" fill="#C59B27" opacity="0.6" />
            <circle cx="230" cy="180" r="1.2" fill="#C59B27" opacity="0.8" />
            <circle cx="242" cy="135" r="1" fill="#C59B27" opacity="0.5" />
            <circle cx="265" cy="160" r="1.5" fill="#C59B27" opacity="0.7" />
            <circle cx="295" cy="155" r="1" fill="#C59B27" opacity="0.9" />
            <circle cx="310" cy="210" r="1" fill="#C59B27" opacity="0.4" />
            <circle cx="328" cy="148" r="1.5" fill="#C59B27" opacity="0.8" />
            <circle cx="340" cy="85" r="1" fill="#C59B27" opacity="0.6" />
            <circle cx="355" cy="120" r="1.2" fill="#C59B27" opacity="0.7" />
          </svg>
        </div>
        <h1 className="font-serif-display text-4xl sm:text-5xl font-medium tracking-wide text-[#0A1128]">
          Xinghuoji
        </h1>
        <p className="text-[10px] font-mono tracking-[0.25em] text-[#C5A880] font-semibold uppercase">
          PRESERVING THE ETERNAL SPARK
        </p>
      </motion.div>

      {/* Master centered Login/Recover Form panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-[0_12px_45px_rgba(10,17,40,0.04)] border border-slate-100/80 p-8 sm:p-10 z-10 flex flex-col my-8 relative"
        id="reset-form-card"
      >
        <div className="space-y-3 mb-6">
          <h2 className="font-serif-display text-3xl font-semibold text-[#0A1128] tracking-tight leading-tight">
            Reset Your Password
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-sans">
            Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2.5 text-xs text-rose-600 mb-6 font-sans">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-gray-400 font-semibold mb-2">
              Email Address
            </label>
            <div className="border-b border-gray-200 focus-within:border-legacy-gold transition-colors duration-300 py-1 flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
                placeholder="e.g. legacy@xinghuoji.com"
                className="w-full bg-transparent outline-none border-none text-sm text-[#0A1128] placeholder-gray-300 font-sans focus:ring-0 select-text py-1"
                required
                disabled={isSubmitting}
              />
            </div>
            {emailError && (
              <p className="text-xs text-rose-500 mt-2 font-sans flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" /> {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white py-4 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:bg-slate-800"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                DISPATCHING LINK...
              </span>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="h-px bg-slate-100 my-8" />

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-xs font-mono font-medium text-slate-600 hover:text-legacy-gold transition-colors duration-200 cursor-pointer self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Login</span>
        </Link>
      </motion.div>

      {/* Centered minimalist static footer */}
      <div className="text-center z-10 select-none mt-4">
        <p className="text-[10px] sm:text-xs font-mono tracking-wider text-slate-400 font-medium">
          &copy; 2024 Xinghuoji. Secure Digital Preservation.
        </p>
      </div>
    </div>
  );
}

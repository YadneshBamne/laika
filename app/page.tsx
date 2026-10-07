import Image from "next/image";
import { Warp } from "@paper-design/shaders-react"

export default function Home() {
  return (
   <main className="relative min-h-screen overflow-hidden">
      {/* Background shader */}
      <div className="absolute inset-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={[
  "hsl(0, 0%, 2%)",
  "hsl(0, 0%, 7%)",
  "hsl(0, 0%, 12%)",
  "hsl(0, 0%, 18%)"
]}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="text-white text-4xl md:text-8xl font-sans font-stretch-90% font-mask italic transition-all ease-initial">LAIKA PVT LTD</h1>
          <h1 className="text-white text-3xl md:text-7xl font-sans uppercase">Coming Soon</h1>

          {/* Email input with submit button */}
          {/* <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-6 py-4 pr-20 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 group">
              <svg
                className="w-5 h-5 text-gray-800 group-hover:translate-x-0.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div> */}

          {/* Description text */}
        </div>
      </div>
    </main>
  );
}

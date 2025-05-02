import Link from 'next/link';
import { FaRobot, FaComments, FaUserShield, FaBolt, FaBrain } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">SecretEcho</h1>
              <p className="text-xl md:text-2xl mb-6">Your Intelligent AI Companion for Meaningful Conversations</p>
              <p className="text-lg mb-8">Experience real-time, personalized conversations with an AI that listens, responds, and learns from your interactions.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-center">
                  Get Started
                </Link>
                <Link href="/auth/login" className="bg-transparent border border-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium text-center">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                <FaRobot className="w-32 h-32 md:w-40 md:h-40 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaComments className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Messaging</h3>
              <p className="text-gray-600">Enjoy seamless, real-time conversations with immediate responses from your AI companion.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaUserShield className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
              <p className="text-gray-600">Your conversations are private and protected with our secure JWT authentication system.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaBolt className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Persistent History</h3>
              <p className="text-gray-600">Never lose a conversation again. Your chat history is saved and synced across devices.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaBrain className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Adaptive AI</h3>
              <p className="text-gray-600">Our AI learns and adapts to your conversation style for a truly personalized experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to chat with your AI?</h2>
          <p className="text-xl mb-8">Create your account now and experience the future of AI companionship.</p>
          <Link href="/auth/register" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium inline-block">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">SecretEcho</h2>
              <p className="text-gray-400">Your AI Companion</p>
            </div>
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} SecretEcho. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

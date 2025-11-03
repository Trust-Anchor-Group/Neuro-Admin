import Image from "next/image";
import { FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 mt-auto py-4 w-full text-center shadow-[0_-1px_5px_rgba(0,0,0,0.1)]">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-lg">Neuro-Admin</h3>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Neuro-Admin. All rights reserved.
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg">Quick Links</h3>
            <nav>
              <a href="/" className="block my-1 hover:underline">
                Home
              </a>
              <a href="/dashboard" className="block my-1 hover:underline">
                Dashboard
              </a>
              <a href="/contact" className="block my-1 hover:underline">
                Contact Us
              </a>
            </nav>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg">Follow Us</h3>
            <div className="flex justify-center mt-1 gap-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="text-current"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        <hr className="my-3" />

        <div className="flex justify-center mt-2">
          <Image src="/neuroAdminLogo.svg" alt="logo" width={32} height={32} unoptimized />
        </div>
      </div>
    </footer>
  );
}

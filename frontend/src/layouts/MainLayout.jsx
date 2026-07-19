import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FAF8F2]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

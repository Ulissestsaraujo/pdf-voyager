import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-blue-600 text-white py-4 px-6 shadow-lg fixed w-full top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Left Side - Logo / Branding */}
                <Link to="/" className="text-xl font-bold hover:text-gray-200 transition">
                    PDF Voyager
                </Link>

                {/* Right Side - Navigation Links */}
                <div className="flex space-x-6">
                    <Link to="/" className="hover:bg-blue-700 px-4 py-2 rounded transition">Home</Link>
                    <Link to="/upload" className="hover:bg-blue-700 px-4 py-2 rounded transition">Upload</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
import { Feather, FileText } from 'lucide-react';

export default function WelcomeStep({ userData, setUserData, onStart }) {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };
    
    const isStudent = userData.occupation === 'Student' || userData.occupation === 'Researcher';
    const isOtherOccupation = userData.occupation === 'Other';
    const isOtherMajor = userData.major === 'Other';

    const handleSubmit = (e) => {
        e.preventDefault();
        onStart();
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl w-full">
                
                {/* --- Cột Giới thiệu (Bên trái) --- */}
                <div className="flex flex-col justify-center text-center lg:text-left">
                    <Feather size={48} className="text-indigo-500 mx-auto lg:mx-0" />
                    <h1 className="mt-4 text-4xl font-bold text-gray-900 leading-tight">
                        Shape2Animal: <br/>
                        <span className="text-indigo-600">Khi AI học cách</span>
                    </h1>
                    
                    <div className="mt-6 space-y-4">
                        <p className="text-gray-700 leading-relaxed text-justify">
                            Chào bạn, cảm ơn bạn đã ghé thăm! 
                            Nghiên cứu này bắt đầu từ một câu hỏi: Nếu con người có thể thấy cả thế giới từ những hình bóng vô tri, liệu AI có làm được như thế? 
                            <strong> Shape2Animal</strong> là nỗ lực của chúng mình để giúp máy tính tìm thấy  bên trong những hình khối ngẫu nhiên. 
                            Những đánh giá chân thực từ bạn chính là mảnh ghép quan trọng giúp chúng mình hoàn thiện nghiên cứu này.
                        </p>
                        
                        <p className="text-gray-500 text-sm leading-relaxed text-justify italic border-l-2 border-indigo-100 pl-4">
                            If humans can find life in ambiguous shapes, can AI do the same? 
                            <strong> Shape2Animal</strong> is our attempt to help AI find the within nature random silhouettes. 
                            Your honest feedback is the vital piece we need to complete this study.
                        </p>
                    </div>
                </div>

                {/* --- Cột Form (Bên phải) --- */}
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <div className="flex items-center mb-6">
                        <FileText className="text-gray-400 mr-3" size={24}/>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Thông tin người tham gia</h2>
                            <p className="text-sm text-gray-500">Participant Information</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên / First Name</label>
                                <input type="text" name="firstName" value={userData.firstName} onChange={handleInputChange} className="mt-1 w-full border p-2 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Họ / Last Name</label>
                                <input type="text" name="lastName" value={userData.lastName} onChange={handleInputChange} className="mt-1 w-full border p-2 rounded-lg" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Giới tính / Gender</label>
                            <select name="gender" value={userData.gender} onChange={handleInputChange} className="mt-1 w-full border p-2 rounded-lg" required>
                                <option value="" disabled>Lựa chọn... / Select...</option>
                                <option value="male">Nam / Male</option>
                                <option value="female">Nữ / Female</option>
                                <option value="other">Khác / Other</option>
                                <option value="prefer_not_to_say">Không muốn nói / Prefer not to say</option>
                            </select>
                        </div>
                        
                        {/* --- Nghề nghiệp / Occupation --- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nghề nghiệp / Occupation</label>
                            <select name="occupation" value={userData.occupation} onChange={handleInputChange} className="mt-1 w-full border p-2 rounded-lg" required>
                                <option value="" disabled>Lựa chọn... / Select...</option>
                                <option value="Student">Sinh viên / Student</option>
                                <option value="Designer">Nhà thiết kế / Designer</option>
                                <option value="Engineer">Kỹ sư / Engineer</option>
                                <option value="Artist">Nghệ sĩ / Artist</option>
                                <option value="Researcher">Nghiên cứu viên / Researcher</option>
                                <option value="Other">Khác / Other</option>
                            </select>
                        </div>

                        {/* --- Chuyên ngành (Nếu là Student/Researcher) --- */}
                        {isStudent && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-gray-700">Chuyên ngành / Major</label>
                                <select name="major" value={userData.major} onChange={handleInputChange} className="mt-1 w-full border p-2 rounded-lg" required>
                                    <option value="" disabled>Lựa chọn... / Select...</option>
                                    <option value="IT">Công nghệ thông tin / IT</option>
                                    <option value="ArtDesign">Nghệ thuật & Thiết kế / Art & Design</option>
                                    <option value="Economics">Kinh tế / Economics</option>
                                    <option value="Medicine">Y khoa / Medicine</option>
                                    <option value="Other">Khác / Other</option>
                                </select>
                            </div>
                        )}
                        {isStudent && isOtherMajor && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-gray-700">Chuyên ngành của bạn / Your Major</label>
                                <input type="text" name="majorOther" value={userData.majorOther} onChange={handleInputChange} className="mt-1 w-full border p-2 rounded-lg" placeholder="Ví dụ: Ngôn ngữ Anh..." required />
                            </div>
                        )}
                        {isOtherOccupation && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-gray-700">Nghề nghiệp của bạn / Your Occupation</label>
                                <input type="text" name="occupationOther" value={userData.occupationOther} onChange={handleInputChange} className="mt-1 w-full border p-2 rounded-lg" placeholder="Ví dụ: Bác sĩ, Giáo viên..." required />
                            </div>
                        )}

                        {/* --- Câu hỏi trải nghiệm / Pareidolia Question --- */}
                        <div className="animate-fade-in mt-4 border-t border-gray-200 pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bạn có bao giờ tưởng tượng ra hình ảnh một con vật (như chú chó, bé mèo...) khi nhìn lên những đám mây chưa?
                            </label>
                            <p className="text-xs text-gray-400 mb-2">Have you ever imagined animal shapes when looking at the clouds?</p>
                            <select 
                                name="pareidoliaExperience" 
                                value={userData.pareidoliaExperience || ""} 
                                onChange={handleInputChange} 
                                className="w-full border p-2 rounded-lg" 
                                required
                            >
                                <option value="" disabled>Lựa chọn... / Select...</option>
                                <option value="yes">Đã từng / Yes, I have</option>
                                <option value="no">Chưa từng / No, never</option>
                            </select>
                        </div>

                        <button type="submit" className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all text-base font-semibold transform hover:scale-[1.02]">
                            Bắt đầu đánh giá
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
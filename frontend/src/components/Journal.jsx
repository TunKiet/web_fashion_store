import { Sparkles } from 'lucide-react';

function Journal() {
  const articles = [
    {
      id: 1,
      image: "/images/aura_hero_model.png",
      title: "EVENING ELEGANCE",
      desc: "Tôn vinh phom dáng dạ hội thanh lịch vượt thời gian, sự kết hợp kiêu kỳ giữa thiết kế cắt may cao cấp và tinh thần phóng khoáng của những đêm tiệc Paris.",
      date: "2 weeks ago"
    },
    {
      id: 2,
      image: "/images/aura_fabric_2.png",
      title: "THE ART OF DRAPING",
      desc: "Khám phá chiều sâu nghệ thuật của kỹ thuật draping xếp nếp thủ công, mang đến những chuyển động uyển chuyển mềm mại trên thớ vải lụa tơ tằm dâu trứ danh.",
      date: "3 weeks ago"
    },
    {
      id: 3,
      image: "/images/aura_fabric_4.png",
      title: "ATELIER SAVOIR-FAIRE",
      desc: "Hành trình di sản đi cùng những chi tiết viền ren thêu hoa chìm Alençon tinh xảo, được hoàn thiện tỉ mỉ bằng hàng trăm giờ làm việc của các nghệ nhân.",
      date: "3 weeks ago"
    }
  ];

  return (
    <section className="aura-journal-section" id="journal-section">
      <div className="container">
        <div className="journal-header">
          <h2 className="journal-title">JOURNAL</h2>
        </div>

        <div className="journal-grid">
          {articles.map(article => (
            <article key={article.id} className="journal-card">
              <div className="journal-card-img-wrapper">
                <img src={article.image} alt={article.title} className="journal-card-img" />
              </div>
              <div className="journal-card-content">
                <h3 className="journal-card-title">{article.title}</h3>
                <p className="journal-card-desc">{article.desc}</p>
                <span className="journal-card-date">
                  <Sparkles size={8} style={{ marginRight: '5px', color: '#bda380' }} />
                  {article.date}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Journal Action */}
        <div className="journal-footer-action">
          <button 
            className="journal-story-btn"
            onClick={() => {
              alert("Chào mừng đến với Tạp chí Thời trang AURA Journal. Chúng tôi luôn cập nhật những xu hướng Haute Couture mới nhất, di sản thủ công và những câu chuyện sáng tạo đằng sau hậu trường thiết kế.");
            }}
          >
            OUR STORY
          </button>
        </div>
      </div>
    </section>
  );
}

export default Journal;

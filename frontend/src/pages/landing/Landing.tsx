import { useNavigate } from 'react-router-dom'
import './landing.css'

export default function Landing() {
  const navigate = useNavigate()

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="zep-landing">

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">ZEPLIN<span>.az</span></a>
        <ul className="nav-links">
          <li><a href="#how">NECƏ İŞLƏYİR</a></li>
          <li><a href="#services">XİDMƏTLƏR</a></li>
          <li><a href="#pickup">PICKUP</a></li>
          <li><a href="#seller">SATICILАР</a></li>
        </ul>
        <button className="nav-cta" onClick={() => scrollTo('seller')}>BAŞLA →</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-tag fade-up">AZƏRBAYCANIN ÖNCƏLİKLİ LOGİSTİKA HƏLLİ</div>
            <h1 className="hero-h1 fade-up-2">
              SƏN SAT.
              <em>BİZ ÇATDIRAQ.</em>
            </h1>
            <p className="hero-sub fade-up-3">Anbar · Çatdırılma · Pickup</p>
            <p className="hero-desc fade-up-3">
              5 AZN məhsula 5 AZN çatdırılma? Bu absurddur.
              Biz satıcılar üçün ucuz çatdırılma, anbar saxlama
              və pulsuz pickup nöqtələri təklif edirik.
            </p>
            <div className="hero-btns fade-up-4">
              <button className="btn-primary" onClick={() => navigate('/register')}>SATICI OL →</button>
              <button className="btn-ghost" onClick={() => scrollTo('how')}>NECƏ İŞLƏYİR</button>
            </div>
            <div className="hero-stats fade-up-4">
              <div>
                <span className="hstat-val">2 AZN</span>
                <span className="hstat-lbl">Çatdırılma</span>
              </div>
              <div>
                <span className="hstat-val">0 AZN</span>
                <span className="hstat-lbl">Pickup</span>
              </div>
              <div>
                <span className="hstat-val">24s</span>
                <span className="hstat-lbl">Cavab vaxtı</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <svg className="zep-svg zep-float" viewBox="0 0 420 290" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="198" cy="88" rx="180" ry="54" fill="#1648a0" opacity="0.18"/>
              <path d="M15,84 Q36,33 198,33 Q363,33 375,84 Q363,135 198,135 Q36,135 15,84 Z"
                fill="#ffffff" stroke="#5a9cd8" strokeWidth="3.5"/>
              <ellipse cx="198" cy="57" rx="102" ry="13" fill="#e8f2ff"/>
              <polygon points="360,60 405,21 417,60" fill="#ffffff" stroke="#5a9cd8" strokeWidth="2.5" strokeLinejoin="round"/>
              <polygon points="360,108 405,147 417,108" fill="#ffffff" stroke="#5a9cd8" strokeWidth="2.5" strokeLinejoin="round"/>
              <polygon points="372,84 420,45 420,123" fill="#ddeaf8" stroke="#5a9cd8" strokeWidth="2.5" strokeLinejoin="round"/>
              <line x1="42" y1="84" x2="357" y2="84" stroke="#5a9cd8" strokeWidth="1" opacity="0.2"/>
              <circle cx="90"  cy="78" r="9"   fill="#1648a0"/>
              <circle cx="90"  cy="73" r="3.5" fill="#fff" opacity="0.55"/>
              <circle cx="138" cy="78" r="9"   fill="#1648a0"/>
              <circle cx="138" cy="73" r="3.5" fill="#fff" opacity="0.55"/>
              <circle cx="186" cy="78" r="9"   fill="#1648a0"/>
              <circle cx="186" cy="73" r="3.5" fill="#fff" opacity="0.55"/>
              <circle cx="234" cy="78" r="9"   fill="#1648a0"/>
              <circle cx="234" cy="73" r="3.5" fill="#fff" opacity="0.55"/>
              <circle cx="282" cy="78" r="9"   fill="#1648a0"/>
              <circle cx="282" cy="73" r="3.5" fill="#fff" opacity="0.55"/>
              <circle cx="330" cy="78" r="9"   fill="#1648a0"/>
              <circle cx="330" cy="73" r="3.5" fill="#fff" opacity="0.55"/>
              <line x1="162" y1="135" x2="162" y2="177" stroke="#5a9cd8" strokeWidth="2.5" strokeDasharray="5,4" opacity="0.6"/>
              <line x1="234" y1="135" x2="234" y2="177" stroke="#5a9cd8" strokeWidth="2.5" strokeDasharray="5,4" opacity="0.6"/>
              <rect x="120" y="177" width="156" height="72" rx="12" fill="#f5c518" stroke="#c9a200" strokeWidth="2"/>
              <rect x="128" y="182" width="140" height="14" rx="6" fill="rgba(255,255,255,0.3)"/>
              <line x1="120" y1="213" x2="276" y2="213" stroke="#c9a200" strokeWidth="2" opacity="0.35"/>
              <line x1="198" y1="177" x2="198" y2="249" stroke="#c9a200" strokeWidth="2" opacity="0.35"/>
              <circle cx="198" cy="210" r="14" fill="#0b1c38"/>
              <circle cx="198" cy="206" r="6"  fill="#f5c518"/>
              <path d="M186,216 Q198,230 210,216" fill="#0b1c38"/>
              <line x1="198" y1="224" x2="198" y2="240" stroke="#0b1c38" strokeWidth="3" strokeLinecap="round"/>
              <ellipse cx="210" cy="254" rx="70" ry="6" fill="rgba(0,0,0,0.12)"/>
            </svg>
          </div>
        </div>

        <div className="scroll-hint">
          <span>AŞAĞI</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="how-inner">
          <div className="section-label">PROSES</div>
          <h2 className="section-title">Necə işləyir?</h2>
          <p className="how-desc">Dörd addımda tam logistika həlli. Siz satışa fokuslanın, qalan hər şeyi biz idarə edirik.</p>
          <div className="how-steps">
            <div className="step-card">
              <div className="step-num">1</div>
              <div className="step-icon">
                <svg fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="step-title">Qeydiyyat</div>
              <div className="step-desc">WhatsApp və ya sayt üzərindən satıcı qeydiyyatı keçin. 5 dəqiqə çəkir.</div>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <div className="step-icon">
                <svg fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className="step-title">Malı bizə ver</div>
              <div className="step-desc">Məhsulunuzu anbara gətirin. Biz saxlayırıq, sistemə salırıq.</div>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <div className="step-icon">
                <svg fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <div className="step-title">Sifariş gəlir</div>
              <div className="step-desc">Müştəri sifariş verir. Çatdırılma ya da pickup seçir.</div>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <div className="step-icon">
                <svg fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div className="step-title">Biz çatdırırıq</div>
              <div className="step-desc">2 AZN-ə çatdırılma və ya müştəri pulsuz pickup nöqtəsindən götürür.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="services-inner">
          <div className="section-label">XİDMƏTLƏR</div>
          <h2 className="section-title">3 xidmət, <em>1 sistem</em></h2>
          <div className="services-grid">
            <div className="svc-card">
              <div className="svc-icon-wrap">
                <svg fill="none" stroke="#f5c518" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className="svc-title">Anbar Saxlama</div>
              <div className="svc-desc">Məhsulunuzu bizim anbarda saxlayırıq. Hər sifariş gəldikdə hazırlayıb göndəririk. Siz evdə rahatlıqda satışla məşğul olun.</div>
              <div className="svc-price">0.30 AZN <span>/ məhsul / ay</span></div>
            </div>
            <div className="svc-card">
              <div className="svc-icon-wrap">
                <svg fill="none" stroke="#f5c518" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div className="svc-title">Sürətli Çatdırılma</div>
              <div className="svc-desc">Sumqayıt daxili 2 AZN, Bakıya 3 AZN. Müştərinin qapısına kimi. Bazardakı ən ucuz qiymət.</div>
              <div className="svc-price">2 AZN <span>/ sifariş</span></div>
            </div>
            <div className="svc-card">
              <div className="svc-icon-wrap">
                <svg fill="none" stroke="#f5c518" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="svc-title">Pulsuz Pickup</div>
              <div className="svc-desc">Müştəri çatdırılma ödəmək istəmir? Problem deyil. Pickup nöqtəmizə gəlib özü götürə bilər — tamamilə pulsuz.</div>
              <div className="svc-price">0 AZN <span>/ pickup</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="numbers">
        <div className="numbers-inner">
          <div className="section-label">RƏQƏMLƏR</div>
          <h2 className="section-title">Real <em>nəticələr</em></h2>
          <div className="numbers-grid">
            <div className="num-card">
              <span className="num-val">450+</span>
              <span className="num-lbl">Aylıq sifariş hədəfi</span>
            </div>
            <div className="num-card">
              <span className="num-val">1500₼</span>
              <span className="num-lbl">Aylıq gəlir potensialı</span>
            </div>
            <div className="num-card">
              <span className="num-val">30 gün</span>
              <span className="num-lbl">Break-even müddəti</span>
            </div>
            <div className="num-card">
              <span className="num-val">2 AZN</span>
              <span className="num-lbl">Bazarın ən ucuz çatdırılması</span>
            </div>
          </div>
        </div>
      </section>

      {/* PICKUP */}
      <section id="pickup">
        <div className="pickup-inner">
          <div className="pickup-sign">
            <div className="sign-3d">
              <div className="sign-3d-header">
                <svg width="38" height="22" viewBox="0 0 90 44">
                  <path d="M4,22 Q18,10 44,8 Q68,6 80,20 Q68,34 44,36 Q18,38 4,22 Z" fill="#fff" stroke="#1648a0" strokeWidth="2.5"/>
                  <ellipse cx="8" cy="22" rx="6" ry="9" fill="#c8daf0" stroke="#1648a0" strokeWidth="2"/>
                  <polygon points="76,12 88,6 88,20" fill="#ddeaf8" stroke="#1648a0" strokeWidth="2" strokeLinejoin="round"/>
                  <polygon points="76,32 88,38 88,24" fill="#b8ccdf" stroke="#1648a0" strokeWidth="2" strokeLinejoin="round"/>
                  <circle cx="30" cy="20" r="3.5" fill="#1648a0"/>
                  <circle cx="44" cy="20" r="3.5" fill="#1648a0"/>
                  <circle cx="58" cy="20" r="3.5" fill="#1648a0"/>
                  <line x1="38" y1="36" x2="42" y2="43" stroke="#1648a0" strokeWidth="1.5" opacity="0.5"/>
                  <line x1="50" y1="36" x2="46" y2="43" stroke="#1648a0" strokeWidth="1.5" opacity="0.5"/>
                  <rect x="30" y="43" width="28" height="10" rx="4" fill="#f5c518"/>
                </svg>
                <div className="sign-3d-brand">ZEPLIN<span>.az</span></div>
              </div>
              <div className="sign-3d-loc">MƏNTƏQƏMİZDƏN</div>
              <div className="sign-3d-big">
                <div className="sign-3d-zero">0</div>
                <div className="sign-3d-azn">
                  <div className="sign-3d-azn-txt">AZN</div>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0b1c38" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="5" r="2.5"/>
                    <path d="M12 8v6M9 11l3 2.5 3-2.5M10 14l-2 5M14 14l2 5"/>
                  </svg>
                </div>
              </div>
              <div className="sign-3d-no">ÇATDIRILMAYA YOX!</div>
              <div className="sign-3d-cta">GƏL GÖTÜR!</div>
              <div className="sign-3d-foot">zeplin.az</div>
            </div>
          </div>
          <div className="pickup-content">
            <div className="section-label">PICKUP NÖQTƏSİ</div>
            <h2 className="section-title">Çatdırılma<br/><em>xərci sıfır</em></h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', marginBottom: '24px' }}>
              Müştəriləriniz 5 AZN məhsul üçün 5 AZN çatdırılma verməkdən imtina edir? Pickup nöqtəmiz bu problemi tam həll edir.
            </p>
            <ul className="pickup-list">
              <li>Müştəri özü gəlib götürür — pulsuz</li>
              <li>Siz satıcı kimi daha çox sifariş alırsınız</li>
              <li>Şəhər üzrə genişlənən pickup şəbəkəsi</li>
              <li>Paket hazır olduqda SMS / WhatsApp bildiriş</li>
              <li>Anbar + pickup kombinasiyası — tam həll</li>
            </ul>
            <button className="btn-primary">PICKUP NÖQTƏSİ TAP →</button>
          </div>
        </div>
      </section>

      {/* SELLER CTA */}
      <section className="seller" id="seller">
        <div className="seller-inner">
          <div className="seller-cards">
            <div className="seller-card">
              <div className="seller-card-icon">
                <svg fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <div>
                <div className="seller-card-title">Instagram mağazalar</div>
                <div className="seller-card-desc">Çatdırılmanı bizə həvalə et, sən satışa fokuslan</div>
              </div>
            </div>
            <div className="seller-card">
              <div className="seller-card-icon">
                <svg fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="16 3 21 3 21 8"/>
                  <line x1="4" y1="20" x2="21" y2="3"/>
                  <polyline points="21 16 21 21 16 21"/>
                  <line x1="15" y1="15" x2="21" y2="21"/>
                </svg>
              </div>
              <div>
                <div className="seller-card-title">3D printer sahibləri</div>
                <div className="seller-card-desc">İstehsal et, biz çatdıraq — logistika stressin sona çatsın</div>
              </div>
            </div>
            <div className="seller-card">
              <div className="seller-card-icon">
                <svg fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div>
                <div className="seller-card-title">Kiçik bizneslər</div>
                <div className="seller-card-desc">Anbar + çatdırılma + pickup — hamısı bir yerdə, ucuz</div>
              </div>
            </div>
            <div className="seller-card">
              <div className="seller-card-icon">
                <svg fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <div className="seller-card-title">İlk 10 sifariş pulsuz</div>
                <div className="seller-card-desc">Risksiz başla, nəticəni gör, sonra qoşul</div>
              </div>
            </div>
          </div>

          <div className="seller-content">
            <div className="seller-msg">SATICILАР ÜÇÜN</div>
            <div className="seller-quote">
              "Çatdırılmanı mən edirəm,
              <em>sən daha çox sat."</em>
            </div>
            <p className="seller-desc">
              Qeydiyyatdan keçin, malınızı bizə verin. Biz saxlayırıq,
              sifarişlər gəldikdə çatdırırıq. Siz sadəcə satışla məşğul olun.
              İlk 10 sifariş tamamilə pulsuz — risksiz başla.
            </p>
            <div className="seller-form">
              <input type="text" className="seller-input" placeholder="Adınız" />
              <input type="text" className="seller-input" placeholder="WhatsApp nömrəsi" />
              <button className="btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => navigate('/register')}>QOŞUL →</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand">ZEPLIN<span>.az</span></div>
            <div className="footer-tagline">SƏN SAT. BİZ ÇATDIRAQ.</div>
            <p className="footer-desc">Azərbaycanın ilk micro-fulfillment şəbəkəsi. Satıcılar üçün anbar, müştərilər üçün ucuz çatdırılma və pulsuz pickup nöqtələri.</p>
          </div>
          <div>
            <div className="footer-col-title">XİDMƏTLƏR</div>
            <ul className="footer-links">
              <li><a href="#">Anbar saxlama</a></li>
              <li><a href="#">Çatdırılma</a></li>
              <li><a href="#">Pickup nöqtəsi</a></li>
              <li><a href="#" onClick={() => navigate('/login')}>Satıcı paneli</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">ƏLAQƏ</div>
            <ul className="footer-links">
              <li><a href="#">WhatsApp</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Sumqayıt</a></li>
              <li><a href="#">Bakı</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 ZEPLIN.AZ — Bütün hüquqlar qorunur</span>
          <span>Sumqayıt &amp; Bakı, Azərbaycan</span>
        </div>
      </footer>

    </div>
  )
}

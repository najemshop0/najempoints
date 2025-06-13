/* الروابط يتم إضافتها في نهاية كل عرض */
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCG4qNppLhPSBeyuoHOMOg7atSshQDDsBQ",
  authDomain: "najemshop-5ceb5.firebaseapp.com",
  projectId: "najemshop-5ceb5",
  storageBucket: "najemshop-5ceb5.firebasestorage.app",
  messagingSenderId: "1037253188224",
  appId: "1:1037253188224:web:28884563da7648b1562465",
  measurementId: "G-VCRHHBLW69"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const socialLinks = [
  { name: "Stake", url: "https://stake.com/?offer=najem&c=4BZwlNQn", icon: "🎰" },
  { name: "LinkSpace", url: "https://link.space/@n7ajem", icon: "🔗" },
  { name: "TikTok", url: "https://www.tiktok.com/@n7ajem?is_from_webapp=1&sender_device=pc", icon: "📱" },
  { name: "Instagram", url: "https://www.instagram.com/n7ajem/", icon: "📷" },
  { name: "Discord", url: "https://discord.com/invite/n7ajem", icon: "💬" },
  { name: "Kick", url: "https://kick.com/n7ajem", icon: "🎥" },
  { name: "Snapchat", url: "https://www.snapchat.com/add/n7ajem?share_id=U6LRoPywpdU&locale=ar-AE", icon: "👻" },
];

const menuButtons = [
  { name: "الرئيسية", icon: "🏠" },
  { name: "العروض", icon: "🎁" },
  { name: "لوحة الصدارة", icon: "🏆" },
  { name: "المتجر", icon: "🛒" },
  { name: "السحب", icon: "💸" },
  { name: "الملف الشخصي", icon: "👤" },
  { name: "تسجيل الخروج", icon: "🚪", action: "logout" }
];

export default function KickPointsApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kickUsername, setKickUsername] = useState("");
  const [points, setPoints] = useState(0);
  const [lastClaim, setLastClaim] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [rewardType, setRewardType] = useState("Paypal");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setKickUsername(data.kickUsername);
          setPoints(data.points);
          setLastClaim(data.lastClaim?.toDate?.() ?? null);
        }
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleSignup = async () => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      kickUsername,
      points: 0,
      lastClaim: serverTimestamp(),
    });
  };

  const handleLogin = () => signInWithEmailAndPassword(auth, email, password);
  const handleLogout = () => signOut(auth);

  const handleClaimPoints = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 18000);
  };

  const handleRewardRequest = async () => {
    if (!user) return;
    const newNotification = `تم إرسال طلب مكافأة (${rewardType})`;
    setNotifications((prev) => [...prev, newNotification]);
    await addDoc(collection(db, "rewardRequests"), {
      userId: user.uid,
      username: kickUsername,
      reward: rewardType,
      requestedAt: new Date(),
    });
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#000", color: "#fff", minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "absolute", top: 140, left: 20, display: "flex", flexDirection: "column", gap: "15px" }}>
        {menuButtons.map((btn) => (
          <button key={btn.name} onClick={btn.action === "logout" ? handleLogout : undefined} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", backgroundColor: "#1a1a1a", color: "#ff8c00", border: "none", borderRadius: "14px 4px", fontSize: "1rem", cursor: "pointer" }}>
            <span>{btn.icon}</span> <span>{btn.name}</span>
          </button>
        ))}
      </div>

      <div style={{ position: "absolute", right: 140, top: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#ff8c00" }}>🔔</button>
        {showNotifications && notifications.length > 0 && (
          <div style={{ backgroundColor: "#222", color: "#ff8c00", padding: "10px", borderRadius: "10px", marginTop: "10px", textAlign: "right", maxWidth: 200 }}>
            <strong>الإشعارات:</strong>
            <ul style={{ paddingRight: 20 }}>
              {notifications.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ position: "absolute", right: 20, top: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <img src="/photo_2025-06-02_06-24-37.jpg" alt="profile" style={{ width: 100, height: 100, borderRadius: "50%", boxShadow: "0 0 30px orange" }} />
        {user && (
          <p style={{ color: "#ff8c00", fontSize: "1rem", marginTop: "10px" }}>
            رصيدك الحالي: <strong>{points}</strong> نقطة
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {socialLinks.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "1.4rem", color: "#ff8c00", padding: "10px 16px", borderRadius: "10px", backgroundColor: "#1a1a1a", textAlign: "center" }}>
              {link.icon}
            </a>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", left: 20, top: 20 }}>
        <img src="/photo_2025-06-02_06-24-37.jpg" alt="right-profile" style={{ width: 100, height: 100, borderRadius: "50%", boxShadow: "0 0 30px orange" }} />
      </div>

      <div style={{ textAlign: "center", marginTop: 140, color: "#ff8c00", fontSize: "2rem", fontWeight: "bold" }}>NAJEM</div>

      <header style={{ padding: "1rem 2rem", background: "linear-gradient(90deg, #ff4500, #ff8c00)", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>🔥 Najem Kick Points 🔥</h1>
      </header>

      <main style={{ maxWidth: "600px", margin: "auto", padding: "2rem 1rem" }}>
        {!user ? (
          <div style={{ backgroundColor: "#1a1a1a", padding: "2rem", borderRadius: "12px", boxShadow: "0 0 20px rgba(255, 140, 0, 0.5)" }}>
            <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
            <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
            <input placeholder="اسم المستخدم على Kick" value={kickUsername} onChange={(e) => setKickUsername(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleLogin} style={{ flex: 1, padding: "10px", backgroundColor: "#ff8c00", color: "#fff", border: "none" }}>تسجيل الدخول</button>
              <button onClick={handleSignup} style={{ flex: 1, padding: "10px", backgroundColor: "#ff4500", color: "#fff", border: "none" }}>إنشاء حساب</button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: "#1a1a1a", padding: "2rem", borderRadius: "12px", boxShadow: "0 0 20px rgba(255, 140, 0, 0.5)" }}>
            <p>مرحبًا، {kickUsername}</p>
            {showMessage && (
              <p style={{ color: "#ff8c00", fontWeight: "bold" }}>
                قم بمشاهدة البث والمشاركة في التحديات والمهام واستبدلها برصيد paypal Usds Stake US Pubg Mobile
              </p>
            )}
            <div style={{ marginTop: "10px" }}>
              <select value={rewardType} onChange={(e) => setRewardType(e.target.value)} style={{ padding: "10px", marginBottom: "10px", width: "100%" }}>
                <option value="Paypal">Paypal</option>
                <option value="Usds">Usds</option>
                <option value="Stake">Stake</option>
                <option value="UC Pubg Mobile">UC Pubg Mobile</option>
              </select>
              <button onClick={handleRewardRequest} style={{ width: "100%", padding: "10px", backgroundColor: "#ff8c00", color: "#fff", border: "none" }}>
                طلب المكافأة
              </button>
            </div>
          </div>
        )}
      </main>

      <footer style={{ backgroundColor: "#111", color: "#ff8c00", textAlign: "center", padding: "1rem", marginTop: "auto", position: "absolute", bottom: 0, width: "100%" }}>
        <p>© 2025 Najem Kick. جميع الحقوق محفوظة.</p>
        <p><a href="https://najemshop.renderforestsites.com" target="_blank" rel="noopener noreferrer" style={{ color: "#ff8c00" }}>الموقع الرسمي</a></p>
      </footer>
    </div>
  );
}

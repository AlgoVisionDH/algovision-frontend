import {Link} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext.jsx";

export default function NavBar() {
    const {user, loading, logout} = useAuth();

    return (
        <nav style={{padding: "12px 16px", borderBottom: "1px solid #eee", display: "flex", gap: 12}}>
            <Link to="/">홈</Link>
            <div style={{marginLeft: "auto", display: "flex", gap: 12, alignItems: "center"}}>
                {loading ? (
                    <span>로딩중...</span>
                ) : user ? (
                    <>
                        <span style={{opacity: 0.8}}>{user.email}</span>
                        <button onClick={logout}>로그아웃</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">로그인</Link>
                        <Link to="/register">회원가입</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
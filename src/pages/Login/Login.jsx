import {Link, useLocation, useNavigate} from "react-router-dom";
import {useMemo, useState} from "react";

export default function Login({onLogin}) {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from ?? "/";

    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [remember, setRemember] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);
    const canSubmit = emailValid && pw.length >= 1 && !submitting;

    async function fakeLoginApi({email, password, remember}) {
        await new Promise((r) => setTimeout(r, 600));

        if (email === "user@example.com" && password === "pass1234") {
            return {ok: true, token: "demo", user: {email}};
        }
        return {ok: false};
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setErrorMsg("");

        try {
            const res = await fakeLoginApi({email, password: pw, remember});
            if (!res.ok) {
                setErrorMsg("이메일 또는 비밀번호가 올바르지 않습니다.");
                return;
            }

            onLogin?.(res.user);
            navigate(from, {replace: true});
        } catch (err) {
            setErrorMsg("잠시 후 다시 시도해주세요.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main role="main" aria-labelledby="loginTitle">
            <form onSubmit={onSubmit} noValidate aria-describedby="formHelp">
                <h1 id="loginTitle">로그인</h1>
                {/* 상단 설명 */}
                <p id="formHelp">이메일과 비밀번호를 입력해주세요.</p>

                {/* 이메일 */}
                <label htmlFor="email">이메일</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg("");
                    }}
                    aria-invalid={email.length > 0 && !emailValid ? "true" : "false"}
                    required
                />
                {email.length > 0 && !emailValid && (
                    <span role="alert" aria-live="polite">
                        이메일 형식을 확인해주세요.
                    </span>
                )}

                {/* 비밀번호 */}
                <div>
                    <label htmlFor="password">비밀번호</label>
                    <input
                        id="password"
                        name="password"
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="비밀번호"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        aria-pressed={showPw}
                        aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                    >
                        {showPw ? "숨기기" : "보기"}
                    </button>
                </div>

                {/* 자동 로그인 */}
                <label htmlFor="remember">
                    <input
                        id="remember"
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                    />
                    자동 로그인
                </label>

                {/* 에러 배너 */}
                {errorMsg && (
                    <div role="alert" aria-live="polite">
                        {errorMsg}
                    </div>
                )}

                <div>
                    <button type="submit" disabled={!canSubmit}>
                        {submitting ? "로그인 중..." : "로그인"}
                    </button>
                </div>

                <nav aria-label="보조 링크">
                    <Link to="/forgot">비밀번호를 잊으셨나요?</Link>{" "}
                    <span aria-hidden="true">·</span>{" "}
                    <Link to="/register">회원가입</Link>
                </nav>
            </form>
        </main>
    );
}
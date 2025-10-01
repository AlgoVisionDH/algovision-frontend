import {useEffect, useMemo, useRef, useState} from "react";
import {Link} from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [nick, setNick] = useState("");

    const [showPw, setShowPw] = useState(false);
    const [showPw2, setShowPw2] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const serverCodeRef = useRef("");

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    const emailValid = useMemo(() => /^\S+@\S+.\S+$/.test(email), [email]);
    const pwScore = useMemo(() => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        if (pw.length >= 12) s++;
        return Math.min(s, 4);
    }, [pw]);
    const pwMatch = pw.length > 0 && pw === pw2;
    const nickValid = nick.trim().length >= 2;

    const canSubmit = emailVerified && emailValid && pwScore >= 2 && pwMatch && nickValid && !submitting;

    const fakeSendCodeApi = async (email) => {
        await new Promise((r) => setTimeout(r, 600));

        const code = String(Math.floor(100000 + Math.random() * 900000));
        serverCodeRef.current = code;

        return {ok: true};
    }

    const fakeVerifyCodeApi = async ({email, code}) => {
        await new Promise((r) => setTimeout(r, 500));

        const ok = code === serverCodeRef.current;
        return {ok};
    }

    async function onSendCode() {
        if (!emailValid || sendingCode || emailVerified || cooldown > 0) return;
        setSendingCode(true);
        setErrorMsg("");
        try {
            const res = await fakeSendCodeApi(email);
            if (res.ok) {
                setCodeSent(true);
                setCooldown(60);
            } else {
                setErrorMsg("인증코드 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        } catch {
            setErrorMsg("인증코드 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setSendingCode(false);
        }
    }

    async function onVerifyCode(e) {
        e?.preventDefault?.();
        if (verifyingCode || emailVerified) return;
        const digitOnly = code.replace(/\D/g, "");
        if (!/^\d{6}$/.test(digitOnly)) {
            setErrorMsg("6자리 인증코드를 입력해주세요.");
            return;
        }
        setVerifyingCode(true);
        setErrorMsg("");
        try {
            const res = await fakeVerifyCodeApi({email, code: digitOnly});
            if (res.ok) {
                setEmailVerified(true);
            } else {
                setErrorMsg("인증코드가 올바르지 않습니다.");
            }
        } catch {
            setErrorMsg("인증 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setVerifyingCode(false);
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        setErrorMsg("");
        try {
            await new Promise((r) => setTimeout(r, 700));
            alert("가입 완료! 이제 로그인해 보세요.");
        } catch {
            setErrorMsg("가입에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main role="main" aria-labelledby="registerTitle">
            <form onSubmit={onSubmit} noValidate>
                <h1 id="registerTitle">회원가입</h1>
                <p id="registerHelp">이메일로 인증코드를 받아 입력하면 가입할 수 있어요.</p>

                {/* 이메일 + 인증코드 전송 */}
                <label htmlFor="email">이메일</label>
                <div>
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
                            setEmailVerified(false);
                            setCode("");
                            setCodeSent(false);
                        }}
                        aria-invalid={email.length > 0 && !emailValid ? "true" : "false"}
                        disabled={emailVerified}
                        required
                    />
                    <button
                        type="button"
                        onClick={onSendCode}
                        disabled={!emailValid || emailVerified || sendingCode || cooldown > 0}
                        aria-disabled={!emailValid || emailVerified || sendingCode || cooldown > 0}
                    >
                        {emailVerified
                            ? "인증완료"
                            : sendingCode
                                ? "전송 중..."
                                : cooldown > 0
                                    ? `재전송 (${cooldown}s)`
                                    : codeSent
                                        ? "다시 보내기"
                                        : "인증코드 보내기"
                        }
                    </button>
                </div>
                {email.length>0&&!emailValid && (
                    <span role="alert" aria-live="polite">이메일 형식을 확인해주세요.</span>
                )}

                {/* 인증코드 입력/검증 */}
                {codeSent && !emailVerified && (
                    <div>
                        <label htmlFor="code">인증코드 (6자리)</label>
                        <input
                            id="code"
                            name="code"
                            inputMode="numeric"
                            pattern="\d{6}"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setCode(v);
                                setErrorMsg("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onVerifyCode(e);
                            }}
                            aria-describedby="codeHelp"
                            required
                        />
                        <small id="codeHelp">메일함(스팸함 포함)에서 코드를 확인해 입력하세요.</small>
                        <div>
                            <button type="button" onClick={onVerifyCode} disabled={verifyingCode || code.length !== 6}>
                                {verifyingCode ? "확인 중…" : "코드 확인"}
                            </button>
                        </div>
                    </div>
                )}

                {/* 비밀번호 */}
                <label htmlFor="password">비밀번호</label>
                <div>
                    <input
                        id="password"
                        name="password"
                        type={showPw ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="최소 8자, 대문자/숫자/기호 권장"
                        value={pw}
                        onChange={(e) => { setPw(e.target.value); setErrorMsg(""); }}
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
                <div aria-live="polite" aria-atomic="true">
                    <small>강도: {["매우 약함","약함","보통","강함","매우 강함"][pwScore]}</small>
                </div>

                {/* 비밀번호 확인 */}
                <label htmlFor="password2">비밀번호 확인</label>
                <div>
                    <input
                        id="password2"
                        name="password2"
                        type={showPw2 ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="비밀번호를 한 번 더 입력"
                        value={pw2}
                        onChange={(e) => { setPw2(e.target.value); setErrorMsg(""); }}
                        aria-invalid={pw2.length > 0 && !pwMatch ? "true" : "false"}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPw2((v) => !v)}
                        aria-pressed={showPw2}
                        aria-label={showPw2 ? "비밀번호 숨기기" : "비밀번호 보기"}
                    >
                        {showPw2 ? "숨기기" : "보기"}
                    </button>
                </div>
                {!pwMatch && pw2.length > 0 && (
                    <span role="alert" aria-live="polite">비밀번호가 일치하지 않습니다.</span>
                )}

                {/* 닉네임 */}
                <label htmlFor="nick">닉네임</label>
                <input
                    id="nick"
                    name="nick"
                    type="text"
                    autoComplete="nickname"
                    placeholder="2~20자"
                    value={nick}
                    onChange={(e) => { setNick(e.target.value); setErrorMsg(""); }}
                    aria-invalid={nick.length > 0 && !nickValid ? "true" : "false"}
                    required
                />
                {!nickValid && nick.length > 0 && (
                    <span role="alert" aria-live="polite">닉네임은 2자 이상이어야 합니다.</span>
                )}

                {/* 에러 배너 */}
                {errorMsg && (
                    <div role="alert" aria-live="polite">{errorMsg}</div>
                )}

                {/* 제출 */}
                <div>
                    <button type="submit" disabled={!canSubmit}>
                        {submitting ? "가입 중…" : "가입하기"}
                    </button>
                </div>

                <p>이미 계정이 있나요? <Link to="/login">로그인</Link></p>
            </form>
        </main>
    )
}
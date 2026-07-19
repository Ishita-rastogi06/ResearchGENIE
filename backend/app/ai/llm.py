"""LLM factory — dynamic provider selection, cached per provider so we
don't pay LangChain client-construction cost on every single chat message.
"""
from functools import lru_cache
from app.config import get_settings

settings = get_settings()


@lru_cache(maxsize=8)
def _build_llm(provider: str, api_key: str):
    """Build (and cache) a LangChain chat model for a given provider+key.

    Cached on (provider, api_key) so switching providers/keys at runtime
    still gets a fresh client, but repeated calls with the same
    provider/key reuse one client instead of re-constructing it (and
    re-doing auth/setup) on every single message — this was a big chunk
    of the "slow" feeling in chat.
    """
    if provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            api_key=api_key,
            model_name="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1024,
            timeout=30,
            max_retries=1,
        )

    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            api_key=api_key,
            model="gpt-4o-mini",
            temperature=0.3,
            max_tokens=1024,
            timeout=30,
            max_retries=1,
        )

    elif provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        # gemini-1.5-flash has been retired by Google; gemini-2.5-flash is
        # the current fast/cheap model in the same tier.
        return ChatGoogleGenerativeAI(
            google_api_key=api_key,
            model="gemini-2.5-flash",
            temperature=0.3,
            max_output_tokens=1024,
            timeout=30,
            max_retries=1,
        )

    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {provider}")


def get_llm(provider_override: str | None = None, api_key_override: str | None = None):
    """Return a (cached) LangChain chat model.

    provider_override / api_key_override let callers (e.g. the chat
    router, using the current user's saved preference) switch at
    runtime without needing a server restart.
    """
    provider = (provider_override or settings.LLM_PROVIDER or "groq").lower()

    key_map = {
        "groq": settings.GROQ_API_KEY,
        "openai": settings.OPENAI_API_KEY,
        "gemini": settings.GOOGLE_API_KEY,
    }
    api_key = api_key_override or key_map.get(provider, "")

    if not api_key:
        raise ValueError(
            f"No API key configured for provider '{provider}'. "
            f"Add one in Settings → AI Provider."
        )

    return _build_llm(provider, api_key)

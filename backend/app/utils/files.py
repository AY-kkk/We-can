"""Resume file extraction: PDF / DOCX / plain text."""

from __future__ import annotations

import io

from app.core.exceptions import ValidationAppError

ALLOWED_EXT = {".pdf", ".docx", ".doc", ".txt", ".md"}


def _extract_pdf(data: bytes) -> str:
    import pdfplumber

    out = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            out.append(page.extract_text() or "")
    return "\n".join(out)


def _extract_docx(data: bytes) -> str:
    import docx

    document = docx.Document(io.BytesIO(data))
    return "\n".join(p.text for p in document.paragraphs)


def extract_resume_text(filename: str, data: bytes) -> str:
    name = (filename or "").lower()
    ext = name[name.rfind(".") :] if "." in name else ""
    if ext not in ALLOWED_EXT:
        raise ValidationAppError(f"不支持的文件类型: {ext or '未知'}")
    try:
        if ext == ".pdf":
            return _extract_pdf(data)
        if ext in {".docx", ".doc"}:
            return _extract_docx(data)
        return data.decode("utf-8", errors="ignore")
    except ValidationAppError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise ValidationAppError(f"文件解析失败: {exc}") from exc

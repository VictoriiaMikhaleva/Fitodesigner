import "../contact-footer.css";

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 3-9.5 18-2.2-7.3L2 11.2 21 3Z" />
      <path d="M21 3 9.3 13.7" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.2 17.8 4.5 20.5V16A8 8 0 1 1 8.4 18.2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.2 4.8h2.1l1.3 3.1-1.7 1a12.2 12.2 0 0 0 5.2 5.2l1-1.7 3.1 1.3v2.1a1.6 1.6 0 0 1-1.8 1.6A14.6 14.6 0 0 1 6.6 6.6a1.6 1.6 0 0 1 1.6-1.8Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

const CONTACTS = [
  {
    label: "Telegram",
    value: "@Victoria_Mikhaleva",
    href: "https://t.me/Victoria_Mikhaleva",
    external: true,
    icon: <PlaneIcon />,
  },
  {
    label: "Max",
    value: "max.ru/Victoria",
    href: "https://max.ru/Victoria",
    external: true,
    icon: <ChatIcon />,
  },
  {
    label: "Email",
    value: "i@vmikhaleva.ru",
    href: "mailto:i@vmikhaleva.ru",
    external: false,
    icon: <MailIcon />,
  },
  {
    label: "Телефон",
    value: "+7 (926) 223-90-57",
    href: "tel:+79262239057",
    external: false,
    icon: <PhoneIcon />,
  },
];

export function ContactFooter() {
  return (
    <footer className="site-closing">
      <section className="contact-block" aria-labelledby="contact-title">
        <h2 className="contact-block__title" id="contact-title">
          Есть вопрос, идея или обратная связь?
        </h2>
        <p className="contact-block__lead">
          Напишите удобным способом — буду рада вашим впечатлениям и предложениям.
        </p>
        <ul className="contact-grid">
          {CONTACTS.map((contact) => (
            <li key={contact.href}>
              <a
                className="contact-card"
                href={contact.href}
                {...(contact.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="contact-card__icon">{contact.icon}</span>
                <span className="contact-card__body">
                  <span className="contact-card__label">{contact.label}</span>
                  <span className="contact-card__value">{contact.value}</span>
                </span>
                <span className="contact-card__arrow">
                  <ArrowIcon />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <div className="site-closing__bar">
        <p className="site-closing__name">Виктория Михалева</p>
        <p className="site-closing__copy">
          © 2026 — Подбор растений · Каталог и тренажёр насмотренности
        </p>
        <p className="site-closing__made">
          <a href="https://content-system.ru/" target="_blank" rel="noopener noreferrer">
            content-system.ru
          </a>
        </p>
      </div>
    </footer>
  );
}

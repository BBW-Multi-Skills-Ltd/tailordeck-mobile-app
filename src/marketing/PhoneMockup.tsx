import { APP_ICON_SRC } from './MarketingLayout'

export type PhoneScreen = 'home' | 'job' | 'profit' | 'invoice'

/** Illustrative app screens in a phone frame (sample data, always shown in the app's light theme). */
export default function PhoneMockup({ screen = 'home', small = false }: { screen?: PhoneScreen; small?: boolean }) {
  return (
    <div className={`mk-phone${small ? ' mk-phone-small' : ''}`} aria-hidden>
      <div className="mk-phone-notch">
        <span />
      </div>
      <div className="mk-phone-screen">
        <div className="mk-app-top">
          <img src={APP_ICON_SRC} alt="" width={26} height={26} />
          <span className="mk-avatar-dot">AO</span>
        </div>

        {screen === 'home' ? (
          <>
            <p className="mk-tiny">Good morning, Amaka</p>
            <h3>Your shop today</h3>
            <div className="mk-app-profit">
              <span>This month</span>
              <strong>₦286,500</strong>
              <small>Profit after expenses</small>
            </div>
            <div className="mk-mini-stats">
              <span>
                <b>12</b>Active jobs
              </span>
              <span>
                <b>4</b>Due soon
              </span>
            </div>
            <div className="mk-app-list">
              <b>Recent jobs</b>
              <span>
                Isioma • Wedding Gown <i>Pending</i>
              </span>
              <span>
                Chinedu • Senator <i>In progress</i>
              </span>
            </div>
          </>
        ) : null}

        {screen === 'job' ? (
          <>
            <p className="mk-tiny">NEW JOB • 1 OF 4</p>
            <h3>Measurements</h3>
            {[
              ['Chest', '38 in'],
              ['Waist', '32 in'],
              ['Hip', '42 in'],
              ['Shoulder', '15 in'],
            ].map(([label, value]) => (
              <div className="mk-fake-field" key={label}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
            <div className="mk-app-action">Continue</div>
          </>
        ) : null}

        {screen === 'profit' ? (
          <>
            <p className="mk-tiny">COSTING</p>
            <h3>Is this job worth it?</h3>
            <div className="mk-profit-ring">
              <strong>₦48,500</strong>
              <span>Estimated profit</span>
            </div>
            <div className="mk-fake-field">
              <span>Charge</span>
              <b>₦85,000</b>
            </div>
            <div className="mk-fake-field">
              <span>Expenses</span>
              <b>₦36,500</b>
            </div>
            <div className="mk-app-action">Save pricing</div>
          </>
        ) : null}

        {screen === 'invoice' ? (
          <>
            <p className="mk-tiny">INVOICE PREVIEW</p>
            <div className="mk-paper">
              <img src={APP_ICON_SRC} alt="" width={22} height={22} />
              <b>Invoice #TD-1048</b>
              <span>Wedding Gown</span>
              <span>Materials & sewing</span>
              <hr />
              <strong>₦125,000</strong>
              <small>Balance: ₦50,000</small>
            </div>
            <div className="mk-app-action">Share on WhatsApp</div>
          </>
        ) : null}
      </div>
    </div>
  )
}

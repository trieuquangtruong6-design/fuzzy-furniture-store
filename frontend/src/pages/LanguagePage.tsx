import { useEffect } from 'react'

export default function LanguagePage() {
  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = ""
    return () => {
      document.body.className = previousClass
    }
  }, [])

  return (
    <div>
      <header className="section-t-space">
        <div className="custom-container">
          <div className="header-panel">
            <a href="/profile">
              <i className="iconsax back-btn" data-icon="arrow-left" />
            </a>
            <h3>Languages</h3>
          </div>
        </div>
      </header>
      <section className="section-b-space">
        <div className="custom-container">
          <ul className="language-list">
            <li className="w-100">
              <div className="form-check form-check-reverse">
                <label className="form-check-label" htmlFor="radio1">English</label>
                <input className="form-check-input" type="radio" name="exampleRadios" id="radio1" defaultValue="option1" defaultChecked />
              </div>
            </li>
            <li className="w-100">
              <div className="form-check form-check-reverse">
                <label className="form-check-label" htmlFor="radio2">Spanish</label>
                <input className="form-check-input" type="radio" name="exampleRadios" id="radio2" defaultValue="option2" />
              </div>
            </li>
            <li className="w-100">
              <div className="form-check form-check-reverse">
                <label className="form-check-label" htmlFor="radio3">France</label>
                <input className="form-check-input" type="radio" name="exampleRadios" id="radio3" defaultValue="option3" />
              </div>
            </li>
            <li className="w-100">
              <div className="form-check form-check-reverse">
                <label className="form-check-label" htmlFor="radio4">Portuguese</label>
                <input className="form-check-input" type="radio" name="exampleRadios" id="radio4" defaultValue="option4" />
              </div>
            </li>
            <li className="w-100">
              <div className="form-check form-check-reverse">
                <label className="form-check-label" htmlFor="radio5">Russian</label>
                <input className="form-check-input" type="radio" name="exampleRadios" id="radio5" defaultValue="option5" />
              </div>
            </li>
            <li className="w-100">
              <div className="form-check form-check-reverse">
                <label className="form-check-label" htmlFor="radio6">Chinese</label>
                <input className="form-check-input" type="radio" name="exampleRadios" id="radio6" defaultValue="option6" />
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
    
  )
}

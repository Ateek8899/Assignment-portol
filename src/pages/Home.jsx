import { Link } from 'react-router-dom'
export default function Home() {
  return (
    <>
      {/* Plain content directly under navbar */}
      <section className="section">
        <div className="container">
          <section className="intro">
            <h2 className="intro-title">Wel Come To IntelliTask</h2>
            <p className="intro-desc">This portal helps teachers assign work quickly and students submit on time with ease. Stay organized, track deadlines, and keep your study flow smooth.</p>
          </section>

          <section className="split">
            <div className="col">
              <h2>Role of Student</h2>
              <p>In the Assignment Portal System, students can easily access their assigned tasks, view submission deadlines, and upload their completed work online.
They can track their submission status, receive feedback or grades from teachers, and manage all their academic assignments in one place.
The portal provides a user-friendly interface that helps students stay organized, meet deadlines, and improve communication with instructors.</p>
            </div>
            <div className="col">
              <img className="split-img" src="/src/images/studens.jpg" alt="Students" />
            </div>
          </section>

          <section className="split">
            <div className="col">
              <img className="split-img" src="/src/images/teacher.jpg" alt="Teacher" />
            </div>
            <div className="col">
              <h2>Roles of Teacher and Student</h2>
              <p className="long-text">Teachers create, schedule, and review assignments, ensuring clear instructions and fair timelines. They monitor submissions and provide feedback to help students improve. Students access their tasks, manage deadlines, and upload work in supported formats. They can add descriptions to clarify their approach or ask quick questions with their submissions. Together, this portal builds a smooth workflow with transparency, accountability, and simple record-keeping for both sides.</p>
            </div>
          </section>
        </div>
      </section>

      {/* Hero with background only for Continue buttons */}
      <section className="hero">
        <div className="container home">
          <header className="section-header">
            <h1 style={{ fontSize: 36, margin: 0 }}>Wel Come to online portal system</h1>
            <p className="muted">Select your role to continue</p>
          </header>

          <div className="grid home-grid">
            <article className="card home-card theme-3 large">
              <h3 style={{ marginTop: 0 }}>Student</h3>
              <p className="muted">Access assignments, track due dates, and submit your work with notes and files.</p>
              <div className="card-actions">
                <Link className="btn btn-pro" to="/student-login">Continue as Student</Link>
              </div>
            </article>

            <article className="card home-card theme-3 large">
              <h3 style={{ marginTop: 0 }}>Teacher</h3>
              <p className="muted">Create assignments by roll range, set deadlines, and review student submissions.</p>
              <div className="card-actions">
                <Link className="btn btn-pro" to="/teacher-login">Continue as Teacher</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  )
}

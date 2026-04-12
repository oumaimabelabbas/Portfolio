import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

function ImageSlider({
  images,
  projectKey,
  title,
  imageErrors,
  onImageError,
  onClearImageError,
  onOpenLightbox,
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef(null)
  const dragRef = useRef({ isDown: false, startX: 0, startScrollLeft: 0, pointerId: null })

  const goToIndex = (index) => {
    const track = trackRef.current
    if (!track) return
    const nextIndex = Math.max(0, Math.min(index, images.length - 1))
    track.scrollTo({ left: track.clientWidth * nextIndex, behavior: 'smooth' })
    setActiveIndex(nextIndex)
  }

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    if (index !== activeIndex) {
      setActiveIndex(index)
    }
  }

  const handlePointerDown = (event) => {
    const track = trackRef.current
    if (!track) return
    dragRef.current = {
      isDown: true,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      pointerId: event.pointerId,
      hasMoved: false,
    }
    track.setPointerCapture(event.pointerId)
    setIsDragging(true)
  }

  const handlePointerMove = (event) => {
    const track = trackRef.current
    if (!track || !dragRef.current.isDown) return
    const delta = event.clientX - dragRef.current.startX
    if (Math.abs(delta) > 6) {
      dragRef.current.hasMoved = true
    }
    track.scrollLeft = dragRef.current.startScrollLeft - delta
  }

  const handlePointerUp = (event) => {
    const track = trackRef.current
    if (!track) return

    const wasTap = !dragRef.current.hasMoved
    const targetAtPointer = document.elementFromPoint(event.clientX, event.clientY)
    const tappedSlide = targetAtPointer?.closest('.slider-slide')

    if (dragRef.current.pointerId !== null) {
      track.releasePointerCapture(dragRef.current.pointerId)
    }
    dragRef.current.isDown = false
    dragRef.current.pointerId = null
    dragRef.current.hasMoved = false
    setIsDragging(false)
    handleScroll()

    if (wasTap && tappedSlide && track.contains(tappedSlide)) {
      const tappedIndex = Number(tappedSlide.getAttribute('data-index'))
      if (!Number.isNaN(tappedIndex)) {
        onOpenLightbox({ projectKey, title, images, index: tappedIndex })
      }
    }
  }

  const handleSlideClick = (index) => {
    if (dragRef.current.hasMoved) {
      dragRef.current.hasMoved = false
      return
    }
    onOpenLightbox({ projectKey, title, images, index })
  }

  return (
    <div className="slider-shell">
      <div
        ref={trackRef}
        className={`slider-track ${isDragging ? 'is-dragging' : ''}`}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {images.map((image, index) => {
          const imageKey = `${projectKey}-${index}`
          return (
            <div className="slider-slide" key={imageKey} data-index={index}>
              <button
                type="button"
                className="slide-image-btn"
                onClick={() => handleSlideClick(index)}
                aria-label={`Agrandir ${title} image ${index + 1}`}
              >
                {!imageErrors[imageKey] ? (
                  <img
                    src={image}
                    alt={`${title} capture ${index + 1}`}
                    className="project-image"
                    onError={() => onImageError(imageKey)}
                    draggable={false}
                  />
                ) : (
                  <button
                    type="button"
                    className="project-image image-fallback image-retry-btn"
                    onClick={() => onClearImageError(imageKey)}
                  >
                    Image projet {index + 1} indisponible - cliquer pour reessayer
                  </button>
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div className="slider-controls">
        <button
          type="button"
          className="slider-btn"
          onClick={() => goToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
        >
          Precedent
        </button>
        <div className="slider-dots">
          {images.map((_, index) => (
            <button
              type="button"
              key={`${projectKey}-dot-${index}`}
              className={`slider-dot ${activeIndex === index ? 'active' : ''}`}
              aria-label={`Aller a l'image ${index + 1}`}
              onClick={() => goToIndex(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="slider-btn"
          onClick={() => goToIndex(activeIndex + 1)}
          disabled={activeIndex === images.length - 1}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

function App() {
  const [imageErrors, setImageErrors] = useState({})
  const [lightbox, setLightbox] = useState(null)

  const profile = {
    firstName: 'Oumaima',
    lastName: 'Belabbas',
    title: 'Futur Ingenieur Logiciel',
    field: 'Ingenierie Logicielle et Systemes Intelligents',
    studyLevel: '2e annee cycle ingenieur - ENSAM Meknes',
    bio: "Etudiante passionnee par le developpement et l'intelligence artificielle.",
    image: '/images/profile.png',
    contacts: [
      { label: 'Telephone', value: '+212 701215791', href: 'tel:+212701215791' },
      {
        label: 'Email',
        value: 'oumaimabelabbas2003@gmail.com',
        href: 'mailto:oumaimabelabbas2003@gmail.com',
      },
      { label: 'Ville', value: 'Sidi Kacem, Maroc' },
      { label: 'GitHub', value: 'oumaimabelabbas', href: 'https://github.com/oumaimabelabbas' },
      { label: 'LinkedIn', value: 'Oumaima Belabbas', href: 'https://www.linkedin.com/in/oumaima-belabbas-6a0245320' },
    ],
  }

  const formations = [
    {
      key: 'ensam-cycle-ingenieur',
      school: 'Ecole Nationale Superieure d\'Art et Metiers (ENSAM) - Meknes',
      degree: 'Cycle ingenieur - Ingenierie Logicielle et Systemes Intelligents',
      period: 'Sep 2024 - Present',
      schoolLogo: '/images/schools/ensam.png',
      schoolInitials: 'EN',
    },
    {
      key: 'ensam-cycle-prepa',
      school: 'Ecole Nationale Superieure d\'Art et Metiers (ENSAM) - Meknes',
      degree: 'Cycle preparatoire integre',
      period: 'Sep 2022 - Jun 2024',
      schoolLogo: '/images/schools/ensam.png',
      schoolInitials: 'EN',
    },
  ]

  const experiences = [
    {
      key: 'inetum-maroc',
      role: 'Stage d\'initiation - INETUM MAROC',
      company: 'INETUM MAROC',
      companyLogo: '/images/companies/inetum.png',
      companyInitials: 'IM',
      period: 'Juillet 2025 (1 mois)',
      location: 'Casablanca, Sidi Maarouf',
      highlights: [
        'Decouverte de l\'ERP Sage X3 et de ses modules: administration, parametrage, achats, ventes, stock, production et relation client.',
        'Comprehension du role des ERP dans la gestion d\'entreprise.',
        'Initiation au developpement Sage X3: code activite, tables, ecrans, fenetres et objets.',
        'Introduction au langage L4G.',
      ],
    },
  ]

  const skills = [
    {
      category: 'Langages de programmation',
      items: ['Python', 'Java', 'C++', 'SQL'],
    },
    {
      category: 'Machine Learning & Data',
      items: [
        'NumPy',
        'Scikit-learn',
        'TensorFlow',
        'Keras',
        'Selenium',
        'BeautifulSoup',
      ],
    },
    {
      category:'API',
    items: ['REST', 'GraphQL']
   },
    {
      category: 'Developpement Web (Frontend & Backend)',
      items: ['HTML', 'CSS', 'JavaScript', 'React.js', 'Node.js', 'Express.js', 'Spring Boot'],
    },
    {
      category: 'Bases de donnees',
      items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle DB'],
    },
    {
      category: 'Systemes d\'exploitation',
      items: ['Linux'],
    },
    {
      category: 'Outils & Technologies',
      items: [
        'Git',
        'GitHub',
        'VS Code',
        'Eclipse',
        'IntelliJ',
        'Docker',
        'Postman',
        'Swagger',
        'Odoo ERP',
      ],
    },
    {
      category: 'Gestion de projet',
      items: ['Agile Scrum', 'Jira', 'MS Project (WBS, Gantt, EVM)'],
    },
  ]

  const projects = [
    {
      key: 'autopredict',
      title: 'AutoPredict - Prediction du prix des voitures',
      images: [
        '/images/projects/autopredict.png',
        '/images/projects/autopredict-2.png',
      ],
      description:
        'Prediction du prix des voitures d\'occasion au Maroc avec data science et intelligence artificielle.',
      details: [
        'Collecte et preparation des donnees CSV avec Pandas.',
        'Comparaison de modeles de regression (Linear, Polynomial, Decision Tree, Random Forest, SVR) avec Scikit-learn.',
        'Developpement du modele via une API REST avec FastAPI.',
        'Developpement d\'une interface web avec Node.js, Express.js, MongoDB, HTML, CSS, JavaScript.',
      ],
      github: 'https://github.com/oumaimabelabbas/AutoPredict',
    },
    {
      key: 'gesture-recognition',
      title: 'Reconnaissance des gestes de la main en temps reel',
      images: [
        '/images/projects/gestures.png',
        '/images/projects/gestures-2.png',
        '/images/projects/gestures-3.png',
      ],
      description:
        'Systeme vision + deep learning pour detection et reconnaissance de gestes depuis flux video.',
      details: [
        'Creation d\'un modele deep learning CNN avec TensorFlow / Keras pour classifier 8 gestes.',
        'Deploiement en temps reel avec OpenCV via webcam.',
        'Detection et reconnaissance des gestes a partir du flux video.',
      ],
      github: 'https://github.com/oumaimabelabbas/hand-gesture-recognition-cnn',
    },
    {
      key: 'activemq',
      title: 'E-commerce ActiveMQ',
      images: [
        '/images/projects/activemq.png',
        '/images/projects/activemq-2.png',
      ],
      description:
        'Architecture asynchrone basee sur ActiveMQ entre producteurs et consommateur de messages.',
      details: [
        'Conception d\'une architecture asynchrone avec ActiveMQ comme broker de messages.',
        'Developpement de 3 producteurs Node.js (Inventaire, Update, Message) publiant sur des files ActiveMQ.',
        'Developpement d\'un consumer Python recuperant les messages et stockant les operations dans MongoDB.',
      ],
      github: 'https://github.com/oumaimabelabbas/ecommerce-activemq',
    },
  ]

  const activities = [
    {
      key: 'ramadania',
      category: 'hackathon',
      title: 'Hackathon RamadanIA - Fes',
      subtitle: 'Ministere de la Transition Numerique',
      points: [
        'Conception de FinNmeh: plateforme web de generation intelligente d\'itineraires touristiques personnalises.',
        'Integration d\'une carte interactive, videos YouTube (vlogs) et experience immersive 360.',
        'Developpement d\'un chatbot pour l\'optimisation en temps reel des plans de voyage.',
      ],
    },
    {
      key: 'devjam',
      category: 'hackathon',
      title: 'Hackathon ENSIAS DevJam 3.0 | Equipe qualifiee au deuxieme tour',
      points: [
        'Developpement d\'une application permettant aux medecins de mettre a jour les dossiers medicaux et aux patients de consulter leur historique.',
      ],
    },
    {
      key: 'gadzy-it',
      category: 'club',
      clubName: 'Club GADZ\'IT',
      title: 'Membre de la Cellule Partenariats & Outreach',
      clubImage: '/images/activities/gadzy-it.png',
      clubInitials: 'GI',
      points: [
        'Contact avec des etablissements scolaires pour promouvoir l\'evenement IT Playground.',
        'Contact avec des startups du secteur gaming pour l\'organisation de l\'evenement L\'AMGS.',
      ],
    },
    {
      key: 'social',
      category: 'club',
      clubName: 'Club Sociale',
      title: 'Membre de la Cellule Soutien',
      clubImage: '/images/activities/social.png',
      clubInitials: 'SC',
      points: [
        'Donner des cours de soutien à des enfants en difficulté',
      ],
    },
  ]

  const certifications = [
    {
      key: 'python-essential',
      name: 'Programming Essentials in Python',
      issuer: 'Cisco Networking Academy',
      image: '/images/certifications/python-essential.png',
      link: 'https://www.credly.com/badges/9126ea1c-241a-4cf2-b92a-0d2d98a27215/public_url',
    },
    {
      key: 'git-github',
      name: 'Git & GitHub',
      issuer: '365 Data Science',
      image: '/images/certifications/git-github.png',
      link: 'https://learn.365datascience.com/c/7a121aab09/',
    },
    {
      key: 'supervised-ml',
      name: 'Supervised Machine Learning: Regression and Classification',
      issuer: 'DeepLearning.AI',
      image: '/images/certifications/supervised-ml.png',
      link: 'https://coursera.org/share/1e4dbb42934660eaba5d5d9776b4575d',
    },
    {
      key: 'sql-associate',
      name: 'SQL Associate',
      issuer: 'DataCamp',
      image: '/images/certifications/sql-associate.png',
      link: 'https://www.datacamp.com/completed/statement-of-accomplishment/track/9e00aee718dc165353ba5ebe72c3e5afae4972cf?utm_medium=organic_social&utm_campaign=sharewidget&utm_content=soa&utm_source=copylink',
    },
  ]

  const languages = ['Francais (Courant)', 'Anglais (Courant)', 'Arabe (Natif)']
  const softSkills = ['Travail en equipe', 'Autonomie', 'Adaptabilite', 'Communication efficace']

  const navItems = useMemo(
    () => [
      { href: '#apropos', label: 'A propos' },
      { href: '#formation', label: 'Formation' },
      { href: '#experience', label: 'Experience' },
      { href: '#competences', label: 'Competences' },
      { href: '#projets', label: 'Projets' },
      { href: '#parascolaire', label: 'Parascolaire' },
      { href: '#certifications', label: 'Certifications' },
    ],
    [],
  )

  const hackathons = activities.filter((activity) => activity.category === 'hackathon')
  const clubs = activities.filter((activity) => activity.category === 'club')

  const handleImageError = (key) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }))
  }

  const clearImageError = (key) => {
    setImageErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const openProjectLightbox = ({ projectKey, title, images, index }) => {
    setLightbox({ projectKey, title, images, index })
  }

  const openCertificationLightbox = (certification) => {
    setLightbox({
      projectKey: certification.key,
      title: certification.name,
      images: [certification.image],
      index: 0,
    })
  }

  const closeLightbox = () => {
    setLightbox(null)
  }

  const navigateLightbox = (step) => {
    setLightbox((prev) => {
      if (!prev) return prev
      const nextIndex = Math.max(0, Math.min(prev.index + step, prev.images.length - 1))
      return { ...prev, index: nextIndex }
    })
  }

  useEffect(() => {
    if (!lightbox) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') navigateLightbox(-1)
      if (event.key === 'ArrowRight') navigateLightbox(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox])

  return (
    <div className="page-shell">
      <header className="navbar">
        <a className="brand" href="#apropos">
          Oumaima Belabbas
        </a>
        <nav>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero-section" id="apropos">
          <div className="hero-photo-wrap">
            {!imageErrors.profile ? (
              <img
                className="hero-photo"
                src={profile.image}
                alt="Portrait de Oumaima Belabbas"
                onError={() => handleImageError('profile')}
              />
            ) : (
              <div className="image-fallback">OB</div>
            )}
          </div>

          <div className="hero-content">
            <p className="eyebrow">Portfolio Professionnel</p>
            <h1>
              {profile.firstName} {profile.lastName}
            </h1>
            <h2>{profile.title}</h2>
            <p className="hero-meta">Filiere: {profile.field}</p>
            <p className="hero-meta">Niveau d'etude: {profile.studyLevel}</p>
            <p className="hero-bio">{profile.bio}</p>
            <div className="chip-list">
              {profile.contacts.map((contact) => (
                <span key={contact.label} className="chip">
                  <strong>{contact.label}:</strong>{' '}
                  {contact.href ? (
                    <a href={contact.href}>{contact.value}</a>
                  ) : (
                    <span>{contact.value}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="formation">
          <div className="section-title-row">
            <h3>Formation</h3>
          </div>
          <div className="timeline">
            {formations.map((formation) => (
              <article key={formation.key} className="card formation-card">
                <div className="formation-row">
                  {!imageErrors[`${formation.key}-logo`] ? (
                    <button
                      type="button"
                      className="formation-logo-btn"
                      onClick={() =>
                        openProjectLightbox({
                          projectKey: `${formation.key}-logo`,
                          title: formation.school,
                          images: [formation.schoolLogo],
                          index: 0,
                        })
                      }
                      aria-label={`Agrandir logo ${formation.school}`}
                    >
                      <img
                        src={formation.schoolLogo}
                        alt={`Logo ${formation.school}`}
                        className="formation-logo"
                        onError={() => handleImageError(`${formation.key}-logo`)}
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="formation-logo image-fallback image-retry-btn"
                      onClick={() => clearImageError(`${formation.key}-logo`)}
                    >
                      {formation.schoolInitials}
                    </button>
                  )}

                  <h4>{formation.school}</h4>
                </div>
                <p className="card-period">{formation.period}</p>
                <p>{formation.degree}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="experience">
          <div className="section-title-row">
            <h3>Experience professionnelle</h3>
          </div>
          {experiences.map((experience) => (
            <article key={experience.key} className="card experience-card">
              <div className="experience-company-row">
                {!imageErrors[`${experience.key}-logo`] ? (
                  <button
                    type="button"
                    className="experience-logo-btn"
                    onClick={() =>
                      openProjectLightbox({
                        projectKey: `${experience.key}-logo`,
                        title: experience.company,
                        images: [experience.companyLogo],
                        index: 0,
                      })
                    }
                    aria-label={`Agrandir logo ${experience.company}`}
                  >
                    <img
                      src={experience.companyLogo}
                      alt={`Logo ${experience.company}`}
                      className="experience-logo"
                      onError={() => handleImageError(`${experience.key}-logo`)}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="experience-logo image-fallback image-retry-btn"
                    onClick={() => clearImageError(`${experience.key}-logo`)}
                  >
                    {experience.companyInitials}
                  </button>
                )}

                <div className="experience-company-info">
                  <p className="experience-company-name">{experience.company}</p>
                  <p className="experience-company-location">{experience.location}</p>
                </div>
              </div>

              <p className="card-period">
                {experience.period}
              </p>
              <h4>{experience.role}</h4>
              <ul>
                {experience.highlights.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="section" id="competences">
          <div className="section-title-row">
            <h3>Competences</h3>
          </div>
          <div className="skill-grid">
            {skills.map((skill) => (
              <article key={skill.category} className="card skill-card">
                <h4>{skill.category}</h4>
                <div className="tag-wrap">
                  {skill.items.map((item) => (
                    <span key={item} className="tag">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="grid-two">
            <article className="card">
              <h4>Langues</h4>
              <ul>
                {languages.map((language) => (
                  <li key={language}>{language}</li>
                ))}
              </ul>
            </article>
            <article className="card">
              <h4>Soft Skills</h4>
              <ul>
                {softSkills.map((softSkill) => (
                  <li key={softSkill}>{softSkill}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="section" id="projets">
          <div className="section-title-row">
            <h3>Projets academiques</h3>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
              <article key={project.key} className="card project-card">
                <ImageSlider
                  images={project.images}
                  projectKey={project.key}
                  title={project.title}
                  imageErrors={imageErrors}
                  onImageError={handleImageError}
                  onClearImageError={clearImageError}
                  onOpenLightbox={openProjectLightbox}
                />
                <h4>{project.title}</h4>
                <p>{project.description}</p>
                <ul>
                  {project.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <a className="link-btn" href={project.github}>
                  Lien GitHub
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="parascolaire">
          <div className="section-title-row">
            <h3>Parascolaire</h3>
          </div>
          <div className="parascolaire-grid">
            <div className="parascolaire-column">
              <h4 className="parascolaire-subtitle">Hackathons</h4>
              <div className="timeline">
                {hackathons.map((activity) => (
                  <article key={activity.key} className="card activity-card">
                    <h4>{activity.title}</h4>
                    <p className="card-period">{activity.subtitle}</p>
                    <ul>
                      {activity.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <div className="parascolaire-column">
              <h4 className="parascolaire-subtitle">Club et Engagement</h4>
              <div className="timeline">
                {clubs.map((activity) => (
                  <article key={activity.key} className="card activity-card">
                    {activity.clubImage ? (
                      <div className="activity-club-row">
                        {!imageErrors[`${activity.key}-club`] ? (
                          <button
                            type="button"
                            className="activity-logo-btn"
                            onClick={() =>
                              openProjectLightbox({
                                projectKey: `${activity.key}-club`,
                                title: activity.title,
                                images: [activity.clubImage],
                                index: 0,
                              })
                            }
                            aria-label={`Agrandir visuel ${activity.title}`}
                          >
                            <img
                              src={activity.clubImage}
                              alt={`Logo ${activity.title}`}
                              className="activity-logo"
                              onError={() => handleImageError(`${activity.key}-club`)}
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="activity-logo image-fallback image-retry-btn"
                            onClick={() => clearImageError(`${activity.key}-club`)}
                          >
                            {activity.clubInitials || 'CL'}
                          </button>
                        )}
                        <p className="activity-club-label">{activity.clubName || 'Club et engagement'}</p>
                      </div>
                    ) : null}
                    <h4>{activity.title}</h4>
                    <p className="card-period">{activity.subtitle}</p>
                    <ul>
                      {activity.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="certifications">
          <div className="section-title-row">
            <h3>Certifications</h3>
          </div>
          <div className="cert-grid">
            {certifications.map((certification) => (
              <article key={certification.key} className="card cert-card">
                {!imageErrors[certification.key] ? (
                  <button
                    type="button"
                    className="cert-image-btn"
                    onClick={() => openCertificationLightbox(certification)}
                    aria-label={`Agrandir ${certification.name}`}
                  >
                    <img
                      src={certification.image}
                      alt={certification.name}
                      className="cert-image"
                      onError={() => handleImageError(certification.key)}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cert-image image-fallback image-retry-btn"
                    onClick={() => clearImageError(certification.key)}
                  >
                    Image certification indisponible - cliquer pour reessayer
                  </button>
                )}
                <h4>{certification.name}</h4>
                <p>{certification.issuer}</p>
                <a className="link-btn" href={certification.link}>
                  Voir la certification
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          {profile.firstName} {profile.lastName} 
        </p>
      </footer>

      {lightbox ? (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true">
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="lightbox-close" onClick={closeLightbox}>
              Fermer
            </button>
            <p className="lightbox-title">{lightbox.title}</p>
            <div className="lightbox-viewer">
              <button
                type="button"
                className="lightbox-nav"
                onClick={() => navigateLightbox(-1)}
                disabled={lightbox.index === 0}
              >
                Precedent
              </button>

              {!imageErrors[`${lightbox.projectKey}-${lightbox.index}`] ? (
                <img
                  src={lightbox.images[lightbox.index]}
                  alt={`${lightbox.title} image ${lightbox.index + 1}`}
                  className="lightbox-image"
                  onError={() => handleImageError(`${lightbox.projectKey}-${lightbox.index}`)}
                />
              ) : (
                <button
                  type="button"
                  className="lightbox-image image-fallback image-retry-btn"
                  onClick={() => clearImageError(`${lightbox.projectKey}-${lightbox.index}`)}
                >
                  Image indisponible - cliquer pour reessayer
                </button>
              )}

              <button
                type="button"
                className="lightbox-nav"
                onClick={() => navigateLightbox(1)}
                disabled={lightbox.index === lightbox.images.length - 1}
              >
                Suivant
              </button>
            </div>

            <div className="lightbox-thumbs">
              {lightbox.images.map((image, index) => {
                const thumbKey = `${lightbox.projectKey}-thumb-${index}`
                const imageKey = `${lightbox.projectKey}-${index}`
                return (
                  <button
                    key={thumbKey}
                    type="button"
                    className={`lightbox-thumb ${lightbox.index === index ? 'active' : ''}`}
                    onClick={() =>
                      setLightbox((prev) => {
                        if (!prev) return prev
                        return { ...prev, index }
                      })
                    }
                    aria-label={`Aller a l'image ${index + 1}`}
                  >
                    {!imageErrors[imageKey] ? (
                      <img
                        src={image}
                        alt={`${lightbox.title} miniature ${index + 1}`}
                        onError={() => handleImageError(imageKey)}
                      />
                    ) : (
                      <span className="thumb-fallback">N/A</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App

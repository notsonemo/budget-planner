<p align="center">
  <img src="screenshots/dashboard.png" alt="BudgetFlow Dashboard" width="100%" />
</p>

<h1 align="center">💸 BudgetFlow</h1>

<p align="center">
  <strong>A modern, minimalist personal budget planner & expense tracker.</strong><br/>
  Built with HTML, CSS, JavaScript, and PHP — no frameworks required.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.0+-777BB4?logo=php&logoColor=white" alt="PHP 8.0+" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" />
</p>

---

## ✨ Features

- **Dashboard** — At-a-glance overview with income, expenses, balance & savings rate cards
- **Interactive Charts** — Donut chart for category breakdown, bar chart for 6-month trends (pure Canvas, zero dependencies)
- **Transaction Management** — Add, edit, delete, search, filter, sort & paginate transactions
- **Category System** — Custom categories with emoji icons and color coding
- **Budget Goals** — Monthly spending limits per category with visual progress tracking
- **Monthly Summary** — Detailed monthly reports with savings ring and CSV export
- **Glassmorphism UI** — Frosted glass cards with `backdrop-filter`, subtle shadows, smooth animations
- **Mobile Responsive** — Collapsible sidebar, adaptive grid layouts, touch-friendly
- **CSV Export** — Export transactions for any month

## 📸 Screenshots

<details>
<summary><strong>Click to expand all screenshots</strong></summary>
<br/>

| Dashboard | Transactions |
|:-:|:-:|
| ![Dashboard](screenshots/dashboard.png) | ![Transactions](screenshots/transactions.png) |

| Categories | Add Transaction Modal |
|:-:|:-:|
| ![Categories](screenshots/categories.png) | ![Modal](screenshots/modal.png) |

</details>

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (vanilla), JavaScript (ES6+) |
| **Backend** | PHP 8.0+ |
| **Database** | SQLite 3 (zero config, file-based) |
| **Charts** | Pure HTML Canvas (no libraries) |
| **Icons** | Inline SVG (Lucide-style) |
| **Typography** | [Inter](https://fonts.google.com/specimen/Inter) + [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts |

## 🚀 Quick Start

### Prerequisites

- **PHP 8.0+** with SQLite extension enabled
- A modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/budget-planner.git
cd budget-planner

# Start the PHP development server
php -S localhost:8000

# Open in your browser
open http://localhost:8000
```

That's it! The SQLite database (`api/budget.db`) is auto-created on first run with default categories.

### Docker (optional)

```bash
docker run -d -p 8000:8000 -v $(pwd):/app -w /app php:8.3-cli php -S 0.0.0.0:8000
```

## 📁 Project Structure

```
budget-planner/
├── index.html              # Single-page application shell
├── api/
│   ├── db.php              # Database connection & schema setup
│   ├── transactions.php    # CRUD + CSV export for transactions
│   ├── categories.php      # CRUD for categories
│   ├── goals.php           # CRUD for budget goals
│   └── budget.db           # SQLite database (auto-created)
├── assets/
│   ├── css/
│   │   └── style.css       # Complete design system
│   └── js/
│       ├── ui.js           # Toast, modal, formatting helpers
│       ├── charts.js       # Canvas donut & bar chart rendering
│       ├── dashboard.js    # Dashboard data loading & rendering
│       ├── transactions.js # Transaction table, search, pagination
│       ├── categories.js   # Category grid management
│       ├── goals.js        # Budget goal cards & progress bars
│       └── app.js          # Router, init, monthly summary
├── screenshots/            # App screenshots for README
├── .gitignore
├── LICENSE
└── README.md
```

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|---|---|---|
| Background | `#F5F5F7` | Page background |
| Surface | `rgba(255,255,255,0.72)` | Glass cards |
| Primary | `#0071E3` | CTAs, active states |
| Success | `#30D158` | Income, positive values |
| Danger | `#FF3B30` | Expenses, destructive |
| Warning | `#FF9500` | Budget alerts |
| Text | `#1D1D1F` | Primary text |
| Text Secondary | `#6E6E73` | Labels, metadata |

### Design Principles

- **Clean minimalism** — strong visual hierarchy with intentional whitespace
- **Glassmorphism** — frosted glass cards with `backdrop-filter: blur(16px)`
- **Micro-animations** — hover lifts, smooth transitions, animated counters
- **Card-based layout** — bento grid with consistent 16px radius
- **Mobile-first** — responsive breakpoints at 480px and 900px

## 🔌 API Reference

All endpoints accept and return JSON. Base path: `/api/`

### Transactions (`/api/transactions.php`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `?month=YYYY-MM` | List transactions (optional filters: `type`, `category_id`, `search`, `month`) |
| `GET` | `?id=N` | Get single transaction |
| `POST` | `/` | Create transaction `{amount, type, date, category_id?, note?}` |
| `PUT` | `?id=N` | Update transaction |
| `DELETE` | `?id=N` | Delete transaction |
| `GET` | `?export=csv&month=YYYY-MM` | Export as CSV |

### Categories (`/api/categories.php`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all categories |
| `GET` | `?id=N` | Get single category |
| `POST` | `/` | Create `{name, icon?, colour?}` |
| `PUT` | `?id=N` | Update category |
| `DELETE` | `?id=N` | Delete (unlinks transactions) |

### Budget Goals (`/api/goals.php`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `?month=YYYY-MM` | List goals for month (includes spent & percentage) |
| `POST` | `/` | Create `{category_id, month, limit_amount}` |
| `PUT` | `?id=N` | Update `{limit_amount}` |
| `DELETE` | `?id=N` | Delete goal |

## 🤝 Contributing

Contributions are welcome! Feel free to submit a PR or open an issue.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ☕ and clean code
</p>

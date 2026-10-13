# 🍔 Smart Food Delivery & Restaurant Management System

A full-stack web application that connects customers, restaurants, delivery riders, and administrators through a centralized food delivery platform. The system allows customers to order food online, restaurants to manage menus and orders, delivery riders to manage deliveries, and administrators to oversee the entire platform.

## 📌 Project Overview

The **Smart Food Delivery & Restaurant Management System** is designed to simplify online food ordering and restaurant operations. It provides role-based dashboards, order management, payment processing, restaurant verification, and administrative controls in one integrated application.

The system follows a RESTful API architecture, with a React frontend communicating with an ASP.NET Core Web API backend and a Microsoft SQL Server database.

## ✨ Key Features

### 👤 Customer Module
- Register and log in to the platform.
- Browse restaurants and available food items.
- View food details and prices.
- Add food items to the cart and place orders.
- Choose online payment or Cash on Delivery.
- View order information and status updates.
- Submit feedback after successful delivery.
- Access a convenient online food ordering experience.

### 🏪 Restaurant Owner Module
- Access a dedicated restaurant dashboard.
- Manage restaurant information and food menus.
- Manage incoming customer orders.
- Update order preparation statuses.
- Track order progress from acceptance to pickup.
- Submit National Identity Card (NID) and trade license documents for verification.
- Monitor restaurant operations through the dashboard.

### 🛵 Delivery Rider Module
- Access the rider dashboard.
- View available delivery assignments.
- Accept delivery orders.
- Manage active and completed deliveries.
- Update delivery status from pickup to successful delivery.

### 🛡️ Administrator Module
- Access a centralized Super Admin dashboard.
- View system statistics, including customers, restaurant owners, riders, restaurants, food items, orders, and revenue.
- Manage users, restaurants, orders, and payments.
- Review pending restaurant verification requests.
- Preview submitted NID and trade license documents.
- Open verification documents for detailed inspection.
- Manage system-wide promotional offers.
- Monitor platform activities and restaurant status.

### 💳 Payment Module
- Support online payments through SSLCommerz.
- Support Cash on Delivery.
- Store payment records associated with orders.
- Track payment status.
- Support refund-related payment records and refund processing integration.

### 📦 Order Management
The application supports the following order statuses:

`Pending` → `Accepted` → `Preparing` → `ReadyForPickup` → `OutForDelivery` → `Delivered`

Orders may also be cancelled when applicable. Status updates help customers, restaurant owners, and delivery riders follow the order lifecycle.

## 🧰 Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend Build Tool | Vite |
| Programming Language | JavaScript |
| UI | HTML, CSS, Bootstrap |
| Backend | ASP.NET Core Web API |
| Backend Framework | .NET 9 |
| Database | Microsoft SQL Server |
| ORM | Entity Framework Core |
| Authentication | JWT-based authentication |
| Authorization | Role-based access control |
| Payment Gateway | SSLCommerz |
| API Communication | RESTful APIs |
| Frontend HTTP Client | Axios |
| Development Tools | Visual Studio, Visual Studio Code |
| Version Control | Git and GitHub |

## 🏗️ System Architecture

The project uses a layered architecture to separate the user interface, API, business logic, and data access responsibilities.

```text
                    ┌─────────────────────────┐
                    │       React + Vite      │
                    │        Frontend         │
                    └────────────┬────────────┘
                                 │
                           Axios / HTTP
                                 │
                    ┌────────────▼────────────┐
                    │   ASP.NET Core Web API  │
                    │      FoodDelivery.API   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     FoodDelivery.Core   │
                    │  Domain & Application   │
                    │       Components        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  FoodDelivery.Infrastructure │
                    │   EF Core / Data Access │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Microsoft SQL Server │
                    └─────────────────────────┘
```

### Backend Structure

- **FoodDelivery.API** — API endpoints, authentication, authorization, and HTTP request handling.
- **FoodDelivery.Core** — Core application and domain components.
- **FoodDelivery.Infrastructure** — Database access, Entity Framework Core configuration, and infrastructure integrations.
- **FoodDelivery.Frontend** — React-based user interface and role-specific dashboards.

## 🔐 Security

- JWT-based authentication for protected API endpoints.
- Role-based authorization for Admin, Customer, Restaurant Owner, and Delivery Rider.
- Password validation and account lockout configuration.
- Email confirmation requirements for account verification.
- Protected administrative endpoints.
- Authenticated access to relevant system resources.

Security configuration should be reviewed before production deployment. Secrets, database credentials, JWT signing keys, and payment gateway credentials must not be committed to GitHub.

## 🔄 Main Application Workflow

1. A user registers and authenticates with the system.
2. The user accesses features according to their assigned role.
3. Customers browse restaurants, select food, and place orders.
4. Restaurants receive orders and update their preparation status.
5. Delivery riders manage assigned deliveries and update delivery progress.
6. Customers can view order progress and provide feedback after delivery.
7. Payments are processed through SSLCommerz or recorded as Cash on Delivery.
8. Administrators manage platform resources and review restaurant verification documents.

## ⚙️ Prerequisites

Install the following before running the application:

- [Node.js](https://nodejs.org/)
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Microsoft SQL Server](https://www.microsoft.com/sql-server)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)
- Git

You will also need valid development configuration for the database, authentication, and payment integration.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd online-Food-Order
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your repository's actual GitHub URL.

### 2. Configure the Backend

Open the backend solution or project in Visual Studio or Visual Studio Code.

Configure the database connection string and other required settings in the appropriate configuration file or development secrets.

Example connection string for a local SQL Server LocalDB instance:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=FoodDeliveryDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

Use the connection-string key expected by your actual `ApplicationDbContext` registration. Do not commit production credentials or secret values.

### 3. Apply Database Migrations

Open a terminal in the repository root and run the migration command using the actual startup and migrations project names:

```bash
dotnet ef database update --project FoodDelivery.Infrastructure --startup-project FoodDelivery.API
```

If the Entity Framework Core CLI is not installed, install it with:

```bash
dotnet tool install --global dotnet-ef
```

If it is already installed, update it when necessary.

### 4. Run the Backend API

From the repository root:

```bash
dotnet run --project FoodDelivery.API
```

The local development API is configured to run at:

```text
http://localhost:5079
```

The actual address may differ depending on your launch settings.

### 5. Configure and Run the Frontend

Open a second terminal:

```bash
cd FoodDelivery.Frontend
npm install
npm run dev
```

Vite will display the local frontend URL in the terminal. In the current development configuration, it is:

```text
http://localhost:5173
```

Open that URL in your browser after starting both the frontend and backend.

## 💰 Payment Integration

The application integrates SSLCommerz for online payment processing and also supports Cash on Delivery.

For local development, configure the appropriate SSLCommerz sandbox credentials and callback URLs. Test successful, failed, and cancelled payment flows before deployment.

Never store live payment credentials in source control. Use environment variables or an appropriate secrets manager.

## 🗂️ Repository Structure

```text
online-Food-Order/
│
├── FoodDelivery.API/
│   ├── Controllers/
│   ├── Configuration/
│   └── Program.cs
│
├── FoodDelivery.Core/
│   ├── DTOs/
│   ├── Entities/
│   └── Application Components
│
├── FoodDelivery.Infrastructure/
│   ├── Data/
│   ├── Migrations/
│   └── Infrastructure Services
│
├── FoodDelivery.Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

*Note: Individual folders may differ according to the current implementation.*

## 🧪 Testing

Before deploying the application, test the following workflows:

- User registration, email confirmation, and login.
- Role-based access to dashboards and protected endpoints.
- Restaurant creation and verification document submission.
- Restaurant menu and order management.
- Customer checkout and order status transitions.
- Rider delivery assignment and completion.
- SSLCommerz payment callbacks and failure handling.
- Cash on Delivery.
- Refund processing.
- Administrative management and verification document previews.

## 🔮 Future Improvements

Potential enhancements include:

- Automated email notifications for order updates.
- Advanced reporting and sales analytics.
- Improved search and restaurant filtering.
- Customer order history and saved addresses.
- Automated deployment and CI/CD.
- Expanded automated testing.
- Production monitoring, logging, and performance optimization.

## 👩‍💻 Project Purpose

This project demonstrates the development of a full-stack food delivery platform using React, ASP.NET Core Web API, Entity Framework Core, and Microsoft SQL Server. It brings together authentication, role-based dashboards, order workflows, payment integration, and administrative management in a single application.

## 📄 License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute the project under an open-source license.

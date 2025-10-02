# Working Days Calculator API

A API designed to calculate future dates by adding working days and hours, intelligently handling weekends, holidays, and standard business hours (8 AM - 12 PM, 1 PM - 5 PM BOG time).

This project was developed as a technical test , at capta, emphasizing clean architecture, maintainability, and robust business logic.

---

## 🚀 Live Endpoint

The API is deployed and accessible on Render.

**Base URL**: [`https://capta-backend.onrender.com/`](https://capta-backend.onrender.com/)

---

## 📋 Table of Contents

1.  [Technology Stack](#-technology-stack)
2.  [Architectural Philosophy](#-architectural-philosophy)
3.  [Key Design Patterns](#-key-design-patterns)
4.  [Getting Started](#-getting-started)
5.  [API Usage](#-api-usage)
6.  [Bonus: AWS CDK Deployment](#-bonus-aws-cdk-deployment)

---

## 🛠️ Technology Stack

* **Backend**: Node.js, Express.js
* **Language**: TypeScript
* **Database**: MongoDB with Mongoose
* **Date/Time**: Luxon
* **Testing**: Jest, Supertest
* **Linting/Formatting**: ESLint, Prettier
* **Deployment**: Render, Docker
* **IaaS (Bonus)**: AWS CDK, AWS Lambda, API Gateway

---

## 🏛️ Architectural Philosophy

### Screaming Architecture

The project is structured using **Screaming Architecture**, meaning the top-level directory structure immediately reveals the application's purpose, not the framework it uses. This approach enforces a clean separation of concerns, leading to a system that is highly maintainable, testable, and adaptable to change.

### Layers

The application is divided into four distinct, independent layers:

* `/src/domain`: This is the heart of the application. It contains the core business logic and rules, completely independent of any framework or external dependency. The **`WorkingDate`** Value Object encapsulates all the complex date calculation logic here.

* `/src/application`: This layer orchestrates domain objects to perform specific use cases. The **`CalendarService`** uses the `WorkingDate` object and a `HolidayRepository` to fulfill the primary use case of calculating a future working date.

* `/src/infrastructure`: This layer handles communication with the outside world: databases, external APIs, etc. The MongoDB connection, logic for fetching the external holiday API, and repository implementations reside here. This separation allows us to swap MongoDB for another database with **zero changes** to the domain or application layers.

* `/src/interfaces`: This is the entry point for external clients—in this case, the **REST API** built with Express.js. It contains controllers, routes, and middleware that translate HTTP requests into calls to the application layer and format the resulting data into HTTP responses.



---

## 🎨 Key Design Patterns

* **Repository Pattern**: Abstracts the data source from the rest of the application. The `IHolidayRepository` interface defines a contract for accessing holiday data. This contract is fulfilled by `MongoHolidayRepository` (for the database) and `ApiHolidayRepository` (for the external API), making the application independent of where the data originates.

* **Strategy & Adapter Patterns**: The `HolidayCacheService` acts as a strategic adapter. It decides which repository to use (cache, database, or external API) based on data freshness (TTL). This encapsulates the caching strategy and adapts the different data sources for seamless use by the `CalendarService`.

* **Dependency Injection (DI)**: A simple, manual DI container (`container.ts`) is used to manage dependencies. Instead of components creating their own dependencies (like a service instantiating its own repository), they are provided ("injected") from a central location. This decouples components and makes unit testing with mocks trivial.

* **Value Object**: The **`WorkingDate`** class is a prime example of a Value Object. It represents a date concept from our domain, its equality is based on its value (the date itself), and it's **immutable**. All operations return a new `WorkingDate` instance, preventing side effects and making the business logic predictable and safe.

---

## 🚀 Getting Started

### Prerequisites

* Node.js v18.x or later
* npm or yarn
* MongoDB instance (local or cloud)
* Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <https://github.com/juan10024/capta-test.git>
    cd <capta-test>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and populate it based on the `.env.example` file.
    ```env
    PORT=4000
    MONGO_URI="your_mongodb_connection_string"
    HOLIDAY_API_URL="https://content.capta.co/Recruitment/WorkingDays.json"
    HOLIDAY_CACHE_TTL_SECONDS=86400
    ```

### Running the Application

* **Development Mode (with hot-reloading):**
    ```bash
    npm run dev
    ```

* **Production Mode:**
    ```bash
    npm run build
    npm start
    ```

### Running Tests

Execute the full suite of unit and integration tests:

```bash
npm test
```

---

## 📖 API Usage

### Endpoint

`GET /api/v1/calculate-date`

Calculates a future date based on a starting date and the number of working days and/or hours to add.

### Query Parameters

| Parameter | Type    | Description                                                                                             | Required |
| :-------- | :------ | :------------------------------------------------------------------------------------------------------ | :------- |
| `date`    | String  | The starting date in ISO 8601 format (e.g., `2025-10-01T14:00:00Z`). Defaults to the current time if omitted. | No       |
| `days`    | Number  | The number of **working days** to add.                                                                  | No       |
| `hours`   | Number  | The number of **working hours** to add.                                                                 | No       |

### Example Request

```bash
curl "[https://capta-backend.onrender.com/api/v1/calculate-date?days=1&hours=4&date=2025-04-08T20:00:00Z](https://capta-backend.onrender.com/api/v1/calculate-date?days=1&hours=4&date=2025-04-08T20:00:00Z)"
```

### Example Response

```json
{
  "date": "2025-04-10T15:00:00Z"
}
```

---

## 🏆 Bonus: AWS CDK Deployment

This repository includes a complete AWS Cloud Development Kit (CDK) stack in the `/cdk` directory. This allows for the automated, repeatable deployment of the application as a serverless API using **AWS Lambda** and **Amazon API Gateway**.

For a detailed walkthrough, please see the **[`DEPLOYMENT_GUIDE.md`](/DEPLOYMENT_GUIDE.md)**.

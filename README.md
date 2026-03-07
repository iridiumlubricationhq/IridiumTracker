# Iridium Tracker — Precision Service Intelligence

**Iridium Tracker** is a bespoke, high-fidelity vehicle service tracking system engineered specifically for the Iridium Workshop. It bridges the gap between mechanical precision and digital clarity, offering real-time insights into service workflows.

Designed for performance and reliability, this system ensures that every vehicle's journey through the workshop is monitored with the same attention to detail as the service itself. It is not just a tracker; it is a commitment to transparency and excellence.

## Core Capabilities

-   **Real-Time Service Monitoring**: Live tracking of vehicle status from intake to final inspection.
-   **Digital Service Records**: Persistent, detailed history of all maintenance, repairs, and upgrades.
-   **QR Code Integration**: Instant access to vehicle data via scannable codes, streamlining the workflow for technicians and providing transparency for clients.
-   **AI-Enhanced Insights**: Leveraging the **Google Gemini API** to provide intelligent service summaries and diagnostic assistance.
-   **Premium Interface**: A crafted user interface built with **React** and **Tailwind CSS**, featuring smooth, physics-based motion and a dark, technical aesthetic that matches the workshop's brand.

## Technology Stack

Built on a robust, modern foundation to ensure speed and maintainability:

-   **Frontend**: React 19, Vite, Tailwind CSS v4, Motion (for animations)
-   **Backend**: Node.js, Express
-   **Database**: Better-SQLite3 (High-performance, server-side local database)
-   **AI Integration**: Google Gemini API (`@google/genai`)
-   **Utilities**: Lucide React (Icons), QRCode.react, Date-fns

## Getting Started

### Prerequisites

-   Node.js (v20 or higher recommended)
-   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd iridium-tracker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory based on `.env.example`.
    ```bash
    cp .env.example .env
    ```
    *   `GEMINI_API_KEY`: Required for AI-powered features.

4.  **Start the Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Architecture

Iridium Tracker utilizes a **hybrid architecture**:
-   **Server-Side**: An Express server handles API requests, database interactions (SQLite), and AI processing.
-   **Client-Side**: A React SPA (Single Page Application) delivers a responsive and interactive user experience.

## License

Private and Confidential. Property of Iridium Workshop.

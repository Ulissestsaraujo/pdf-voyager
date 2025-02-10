# PDF Voyager 🚀

PDF Voyager is a **cloud-based document management system** that allows users to **upload, organize, and read PDFs** seamlessly. Built using **React, .NET, and Azure**, this project showcases **modern full-stack development**, cloud infrastructure, and CI/CD best practices.

👉 [Live Demo]([#](https://victorious-plant-099cd7303.4.azurestaticapps.net/))

---

## ✨ Features

- **Drag & Drop PDF Uploads** – Upload PDFs to **Azure Blob Storage** via a user-friendly interface.
- **Document Library** – View all uploaded PDFs with metadata (**title, upload date, user ID**).
- **Secure PDF Viewer** – Open and read PDFs stored in Azure, with **read-only SAS token authentication**.
- **Cross-Device Sync** – Progress is saved, allowing users to **resume where they left off**. *TODO*
- **Secure Authentication** – Integrated **Azure AD B2C** for seamless authentication. *TODO*
- **Cost-Effective & Scalable** – Built using Azure services with **serverless hosting** and 90% Free tier.

---

## 🏗️ Architecture
[React Frontend] → [Azure Static Web Apps]
↓
[.NET Backend] → [Azure App Service]
↓
[Azure Blob Storage] → PDF Files
↓
[Azure Cosmos DB] → Metadata
↓
[Azure AD B2C] → Authentication
---

## 💻 Tech Stack

### **Frontend**
- **React** (TypeScript) – Modern UI development.
- **Vite** – Fast and optimized React builds.
- **Tailwind CSS** – Beautiful and scalable styling.
- **React Router** – SPA navigation.
- **pdf.js** – High-performance PDF rendering.

### **Backend**
- **.NET 9 (C#)** – RESTful API with clean architecture.
- **Azure Blob Storage** – Secure PDF storage.
- **Azure Cosmos DB** – NoSQL database for metadata storage.
- **Azure Key Vault** – Securely managing API secrets.

### **DevOps & Deployment**
- **GitHub Actions** – Automated CI/CD for deployments.
- **Azure Static Web Apps** – Serverless React frontend hosting.
- **Azure App Service** – Scalable backend hosting.
- **Azure Application Insights** – Monitoring & logging.

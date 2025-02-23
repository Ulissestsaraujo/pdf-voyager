# PDF Voyager 🚀

PDF Voyager is a **cloud-based document management system** that allows users to **upload, organize, and read PDFs** seamlessly. Built using **React, .NET, and Azure**, this project showcases **modern full-stack development**, cloud infrastructure, and CI/CD best practices.

👉 [Live Demo](https://www.pdfvoyager.com/)

---

## ✨ Features

- **Drag & Drop PDF Uploads** – Upload PDFs to **Azure Blob Storage** via a user-friendly interface.
- **Document Library** – View all uploaded PDFs with metadata (**title, upload date, user ID**).
- **Secure PDF Viewer** – Open and read PDFs stored in Azure, with **read-only SAS token authentication**.
- **Cross-Device Sync** – Progress is saved, allowing users to **resume where they left off**. 
- **Secure Authentication** – HttpOnly Secure Cookies with JWT access and refresh tokens.
- **Cost-Effective & Scalable** – Built using Azure services with **serverless hosting** and 90% Free tier.
- **Mobile reading experience** - Improved mobile mode reading experience
- **Highlighting and Note taking** - Enable highlights and notes to be taken. Add direct access to highlights **TODO**.
- **Customizable color pallettes for Highlighting** - Enable the user to pick a small pallette of colors that they which to colour their highlights with **TODO**.
- **Eye to view password** - Needs an eye to click on to view password when inputing it. **TODO**
- **Rename and delete assets** - Enable deleting and renaming files. **TODO**
- **Folders** - Enable sorting pdfs in differnet folders. **TODO**

---

## 🏗️ Architecture
```
[React Frontend] → [Azure Static Web Apps]
↓
[.NET Backend] → [Azure App Service]
↓
[Azure Blob Storage] → PDF Files
↓
[Azure MySQL] → PDF Metadata, Reading Progresses and Notes
↓
[JWT & Azure Key Vault] → Authentication & Secrets
```
---

## 💻 Tech Stack

### **Frontend**
- **React** (TypeScript) – Modern UI development.
- **Vite** – Fast and optimized React builds.
- **Tailwind CSS** – Beautiful and scalable styling.
- **React Router** – SPA navigation.
- **pdf.js & react-pdf** – High-performance PDF rendering.

### **Backend**
- **.NET 9 (C#)** – RESTful API with clean architecture.
- **Azure Blob Storage** – Secure PDF storage.
- **Azure MySQL** – SQL database for storage.
- **Azure Key Vault** – Securely managing API secrets.

### **DevOps & Deployment**
- **GitHub Actions** – Automated CI/CD for deployments.
- **Azure Static Web Apps** – Serverless React frontend hosting.
- **Azure App Service** – Scalable backend hosting.
- **Azure Application Insights** – Monitoring & logging.

# Protein Designer
### By Eric Guan, Kartik Vanjani, and Patrick Ging
Proteins are responsible for every biological function of life, from DNA replication to powering muscle contraction. By designing new proteins from scratch, it becomes possible to create targeted therapeutics to treat diseases.

While there exists many tools to facilitate protein design, they often take the form of CLI tools that require an prohibitive amount of technical literacy and file management. Our hope is to reduce this barrier by handling the execution of models, file and metadata management, and doing it all in a resource friendly way. 

### Our solution:
One of the models that fascinated us was [RFDiffusion3](https://www.ipd.uw.edu/2025/12/rfdiffusion3-now-available/), a diffusion model for creating new proteins given an base protein and a section that should remain in the new model produced. We decided to make a web platform that allows users to run RFDiffusion3 from end to end without the need for CLI tools or local hardware. 

<img width="1854" height="904" alt="image" src="https://github.com/user-attachments/assets/960d01b5-d889-4d5f-8fa6-9789eae22995" />


### Tech Stack and APIs:
- React / Vite for the Frontend Framework
- ExpressJS for the backend
- PostgreSQL for the relational database hosted on Supabase
- Microsoft Azure Blob Storage for Blob Storage
- Frontend hosting on Vercel
- Backend hosting on Microsoft Azure Cloud
- Molstar for the frontend protein visualization
- Fastq for task queue on the backend monolith
- Neurosnap for RFDiffusion3 Interfacing

<img width="632" height="354" alt="Screenshot 2026-04-18 at 12 09 59 PM" src="https://github.com/user-attachments/assets/b010a723-fb1e-4168-8ee6-fac1430d085a" />

### See more:
- [How the workflow works](https://github.com/patging/ProteinDesigner/blob/main/docs/WorkflowExplained.md)
- Gallery of features

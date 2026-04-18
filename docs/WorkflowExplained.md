# RFDiffusion3 Workflow

<img width="807" height="305" alt="image" src="https://github.com/user-attachments/assets/b8b957de-6dd8-48d3-86e6-2cda96357450" />

Our workflow for interfacing with RFDiffusion3 can be broken up into 4 major steps:
1. Initialization
2. Waiting on the queue
3. Interfacing
4. Writing results

### Initialization
In this step, data from the API request is organized and being readied for the workflow. The input file is uploaded to Azure Blob Storage and an initial entry is made into the database documenting the job, giving it the status of INQUEUE. It it then placed onto the queue and a response is returned with the job's ID in the database.

### Waiting  in the Queue
The job is waiting in the queue. For the sake of completing our project, we initially used a volatile in memory queue for called [fastq](https://www.npmjs.com/package/fastq). This allowed us to keep the workflow in the monolith while also having the benefits of a queue. It would be better though (scaling wise) to have a decoupled queue and serverless functions. However, it worked for the purposes of our project. 

### Interfacing
We used [Neurosnap's RFDiffusion3 API](https://neurosnap.ai/service/RFdiffusion3) for interfacing with the API model. When a job came off the queue we called the RFDiffusion3 API to create a new model (by this point, the job's status would be set to RUNNING). Every 60 seconds after the initial call, we would ping the job to check on its status. 

### Writing Results
When the Neurosnap Job was done, if it completed successfully, we would update the information about the job and set its status to COMPLETED. If it timed out, we would set the status to FAILED. 

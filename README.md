# AWS_AB_redirect
AB redirect testing using AWS cloudfront, Lambda services 
There are multiple soultion to do AB Redictect testing server side directly. 

## Module 1 - Random A/B
https://catalog.us-east-1.prod.workshops.aws/workshops/e507820e-bd46-421f-b417-107cd608a3b2/en-US/004-module-1
## Module 2 - Sticky random A/B
https://catalog.us-east-1.prod.workshops.aws/workshops/e507820e-bd46-421f-b417-107cd608a3b2/en-US/005-module-2
##  Module 3 - External switch A/B
In this module we will see how we can externalize the configuration used for the segmentation between initial home page and the new home page. This will allow us to change the segmentation percent without any deployment.
### Option 1: S3
https://catalog.us-east-1.prod.workshops.aws/workshops/e507820e-bd46-421f-b417-107cd608a3b2/en-US/006-module-3/001-s3
### Option 2 - S3 and CloudFront (We will discuss this setup)
https://catalog.us-east-1.prod.workshops.aws/workshops/e507820e-bd46-421f-b417-107cd608a3b2/en-US/006-module-3/002-s3-cf
### Option 3 - DynamoDB
https://catalog.us-east-1.prod.workshops.aws/workshops/e507820e-bd46-421f-b417-107cd608a3b2/en-US/006-module-3/003-dynamodb

![image](https://github.com/sunny4989/AWS_AB_redirect/assets/1546164/dfb31350-c220-4ea1-81b5-19f8e41eec7e)



## Steps

- Create Lambda function
   ![image](https://github.com/sunny4989/AWS_AB_redirect/assets/1546164/c1c850c2-0dd4-49f8-a8ad-3a650678f6c6)
     - Setup from authore from scratch as shared in the image above.
  - **Add trigger ** which will run the lambda function to cloud front. Click on the add trigger button.
      ![image](https://github.com/sunny4989/AWS_AB_redirect/assets/1546164/2a6d5534-d0d0-4558-886d-3929a3951204)
    - Select a source as cloudfront.
    - Click on deploy lambda@Edge
    - Selct Distrubution which is cloudfront account
    - select Cache behaviour(Cache behaviour help to set what information is needed in the lambda function to execule and which path it should run. Details will be shared in the next steps)
    - select CloudFront event as origin request
    - select Donfirm deployment of lambda@edge
     - and finally deploy.

   - Go to the **cloudfront** now and select your account and go to **behavior**. click on **create behaviour**
 ![image](https://github.com/sunny4989/AWS_AB_redirect/assets/1546164/72660b64-72ca-4bb5-8176-a86b25566c9c)
     - ** Define path pattern** where the lambda function should run
     - **Origin and origin behaviour** provide the domain to qualify
     - **viewer policy** as **http and https**
     - **Allowed http methods** as  **get, head**
     - cache key control -
     - **set cache policy ** as shared in the below screenshot.
![image](https://github.com/sunny4989/AWS_AB_redirect/assets/1546164/db4a61ba-4ffe-450a-8707-573807f86d25)
     - Create new **Origin Request Policy** as shared in below image:
![image](https://github.com/sunny4989/AWS_AB_redirect/assets/1546164/f0fac778-2699-4dd4-9d10-200d71dbc184)
     -  make sure that the **smooth streaming** is set **no**
      
   

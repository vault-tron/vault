### Creating custom AWS Lambda layer

- run `pip install -r requirements.txt -t .` in this directory
- run `zip -r lambda_function.zip .`
- run `rm -rf !(lambda_function.py|lambda_function.zip|README.md|requirements.txt)`
- upload `lambda_function.zip` to AWS Lambda and expose via API as needed

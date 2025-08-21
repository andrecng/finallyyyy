from setuptools import setup, find_packages

setup(
    name="fondforex-backend",
    version="1.0.0",
    description="FondForex Money Management Backend",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "pydantic>=2.5.0",
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "scipy>=1.11.0",
        "requests>=2.31.0",
        "pytest>=7.4.0",
        "httpx>=0.25.0",
        "watchfiles>=0.21.0",
    ],
    python_requires=">=3.11",
)

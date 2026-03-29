from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

setup(
	name="manpower",
	version="0.0.1",
	description="Custom module for Manpower Kuwait contracts",
	author="User",
	author_email="test@example.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)

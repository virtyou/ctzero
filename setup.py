from setuptools import setup

setup(
    name='ctzero',
    version="0.1.1",
    author='Mario Balibrera',
    author_email='mario.balibrera@gmail.com',
    license='MIT License',
    description='User plugin for cantools (ct)',
    long_description='This package contains the core zero libraries.',
    packages=[
        'ctzero'
    ],
    zip_safe = False,
    install_requires = [
        "vosk >= 0.3.45",
        "argostranslate >= 1.9.6"
    ],
    entry_points = '''''',
    classifiers = [
        'Development Status :: 3 - Alpha',
        'Environment :: Console',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
)

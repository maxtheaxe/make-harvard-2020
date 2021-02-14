# VaxPort
There is a clear need for the ability to verify that someone has received a (legitimate) vaccine during and in the eventual wake of the pandemic. Existing solutions either consist of an easily-counterfeit-able piece of paper, or up-and-coming verification systems that rely on centralized servers, which represent a single point of failure.

## What it does
VaxPort is a decentralized system that allows independent operators to cryptographically verify that someone has received a (legitimate) vaccine by scanning their QR code with a simple app we've built. A doctor administers a vaccine which produces a QR code for a patient, that QR code gets scanned, and the patient's vaccine gets verified so the person can safely return to life. 

## How we built it
* A library built with PGPy handles all crypto stuff
* A series of flask servers handle verification, issue of, and keyservers for vaccines given out using the system
* An app built with React Native scans QR codes and communicates with our servers to verify those who claim to have received the vaccine

## Challenges we ran into
* It was tough to make sure each individually-made component was communicating on the same effective wavelength

## Accomplishments that we're proud of
* We successfully built a complete prototype of our application, the servers it communicates with

## What we learned
* Vaccine verification will absolutely present a significant problem for governments, as the world moves toward reaching pandemic “escape velocity”
* We hope our efforts and associated prototype present some helpful creative thinking about one of many potential solutions

## What's next for VaxPort
* There’s no reason VaxPort should be limited to COVID vaccines (and it’s not, as far as our prototype is concerned).
* It’s not unreasonable to say a state government could mandate VaxPort’s usage, though the bureaucratic obstacle that presents is a different beast altogether.

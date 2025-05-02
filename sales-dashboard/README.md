# Sales Dashboard

## Overview
The Sales Dashboard is a web application designed to visualize sales performance data for sales representatives. It provides a leaderboard, detailed metrics for each representative, and a new feature that tracks points towards rewards.

## Features
- **Leaderboard**: Displays the top sales representatives based on their performance metrics.
- **Sales Metrics**: Detailed view of each representative's sales data, including current amounts, targets, and ranks.
- **Points Meter**: A fill-up meter that shows the points accumulated by each representative, with milestones at 500, 1000, and 2000 points. It also indicates how many points are needed to reach the next milestone for rewards.

## File Structure
```
sales-dashboard
├── src
│   ├── App.js          # Main component managing state and rendering the dashboard
│   ├── components
│   │   └── PointsMeter.js  # Component for displaying the points fill-up meter
│   ├── App.css         # Styles for the application
│   └── index.js        # Entry point of the application
├── package.json        # Configuration file for npm
└── README.md           # Documentation for the project
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd sales-dashboard
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the application, run:
```
npm start
```
This will launch the application in your default web browser.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.
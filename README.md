# Building Energy Efficiency Simulation Dashboard

A web-based interactive dashboard for simulating and evaluating energy efficiency interventions in commercial buildings. This tool helps building managers, engineers, and sustainability professionals assess potential energy savings, costs, and environmental benefits of various energy efficiency measures.

## Features

- **Building Information Modeling**: Input building dimensions, occupancy, and energy consumption details
- **Multiple Intervention Analysis**: Evaluate various energy efficiency measures including:
  - Building envelope improvements (solar glass, reflective roof)
  - HVAC system upgrades
  - Lighting system optimizations 
  - Water system efficiency
  - Building management systems
- **Comprehensive Financial Analysis**:
  - Investment costs for each intervention
  - Annual cost savings calculation
  - Payback period estimation
- **Environmental Impact Assessment**:
  - Energy reduction calculations
  - CO₂ emission reduction estimates
- **Interactive Visualization**:
  - Energy consumption breakdown by device type
  - Projected energy reduction visualization
  - Before/after comparison charts

## Getting Started

### Installation

This dashboard is a standalone HTML application that requires no installation:

1. Download the `index.html` file
2. Open it in any modern web browser (Chrome, Firefox, Safari, Edge)

That's it! No server, no build process, no dependencies to install.

### Usage

1. **Input Building Data**:
   - Enter building dimensions
   - Set number of floors and floor height
   - Enter window-to-wall ratio
   - Select roof type and configuration
   - Input monthly electricity bill
   - Choose the dominant cooling system type
   - Set electricity tariff and emission factor

2. **Select Interventions**:
   - Check or select which energy efficiency measures to implement
   - Adjust investment costs if necessary

3. **Review Results**:
   - See calculated energy savings
   - Review CO₂ reduction
   - Analyze cost savings
   - Check payback period
   - Examine energy consumption visualization

## Intervention Types

### Building Envelope
- **Solar Glass**: Reduces solar heat gain through windows
- **Reflective Roof**: Decreases heat absorption through roofing materials

### Cooling System
- Options for both central AC and split unit buildings:
  - Air-cooled chillers
  - Water-cooled chillers
  - VRF systems
  - Package units
  - High-efficiency split units

### Air Handling System
- **Exhaust Fan Sensors**: Install sensors for more efficient ventilation

### Lighting System
- **LED Lights**: Replace CFL with energy-efficient LED lighting
- **Lighting Control Systems**: Implement separate or centralized lighting controls

### Water System
- **Pump Improvements**: Replace pumps or add frequency drive controls
- **On-demand Water Heaters**: Replace old water heating systems

### Building Management
- **Building Management System (BMS)**: Centralized control of building systems
- **Energy Monitoring System (EMS)**: Real-time energy usage tracking

## Technical Details

This dashboard is built using:
- HTML5
- CSS (Tailwind CSS framework)
- JavaScript (React framework)
- Data visualization with Recharts

All libraries are loaded via CDN, making the dashboard a fully self-contained single HTML file.

## Customization

To customize the dashboard:

1. **Modify Default Values**: Edit the initial state values in the React component
2. **Change Calculation Parameters**: Adjust the formulas in the useEffect hook
3. **Update UI Elements**: Modify the JSX structure and Tailwind CSS classes
4. **Extend Functionality**: Add new intervention types or calculation methods

## License

[MIT License](https://opensource.org/licenses/MIT)

## Acknowledgments

- Energy efficiency calculation methodologies based on industry standards
- Visualization design inspired by modern energy management dashboards
- Built with open-source technologies

---

For questions, feedback, or support, please open an issue in this repository.

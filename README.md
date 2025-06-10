# Multi-Agent Medical Diagnosis System

A sophisticated medical consultation platform that utilizes multiple AI agents to provide comprehensive diagnostic analysis and treatment recommendations.

## Features

### Core Functionality
- **Multi-Agent Consultation**: Four specialized AI agents (GP, Cardiologist, Research Agent, Senior Diagnostician) collaborate on each case
- **Real-time Conversations**: Interactive chat interface with agent responses and confidence scoring
- **Diagnostic Consensus**: Automated consensus generation with agreement tracking
- **Follow-up Support**: Ask additional questions and get expert responses

### Advanced Analysis
- **Risk Assessment**: Visual risk indicators with detailed factor analysis
- **Cost Estimation**: Diagnostic and treatment cost projections
- **Timeline Visualization**: Track consultation progression and agent response times
- **Diagnostic Comparison**: Confidence analysis and performance metrics
- **Medical Report Generation**: Professional reports in multiple formats

### Smart Case Management
- **Template Loading**: Pre-configured medical cases for testing
- **Smart Generation**: AI-powered case creation based on symptoms and specialty
- **Advanced Search**: Filter-based case generation with specialty targeting
- **Export Functionality**: Download consultation data and reports

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI Integration**: OpenAI GPT-4o for agent responses
- **Data Management**: In-memory storage with Drizzle ORM schemas
- **State Management**: TanStack Query for data fetching

## Prerequisites

- Node.js 20+
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd medical-diagnosis-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Add your OpenAI API key
export OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### Creating a Medical Case
1. Fill in patient information (ID, age, gender)
2. Describe the chief complaint and symptoms
3. Add any available test results
4. Click "Create Case"

### Starting a Consultation
1. After creating a case, click "Start Agent Consultation"
2. Watch as each AI agent provides their assessment
3. View the diagnostic consensus when complete

### Advanced Features
- **Timeline View**: Click "Show Timeline" to see consultation progression
- **Analysis Dashboard**: Use "Analysis" button for detailed metrics
- **Report Generation**: Generate professional medical reports
- **Smart Case Creation**: Use "Smart Generate" for AI-assisted case creation

## AI Agents

### General Practitioner
- Primary care assessment
- Initial differential diagnosis
- Specialist referral recommendations

### Cardiologist
- Cardiovascular evaluation
- Cardiac test interpretation
- Heart-related treatment plans

### Research Agent
- Evidence-based analysis
- Medical literature review
- Risk score calculations

### Senior Diagnostician
- Final diagnostic synthesis
- Treatment recommendations
- Clinical decision support

## API Endpoints

- `POST /api/cases` - Create medical case
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get specific case
- `POST /api/conversations` - Start conversation
- `POST /api/conversations/:id/start` - Begin agent consultation
- `POST /api/conversations/:id/message` - Send follow-up message

## Security & Privacy

- All patient data is stored in-memory (not persistent)
- OpenAI API calls use secure connections
- No PHI is permanently stored
- Designed for educational and demonstration purposes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational and demonstration purposes. Please ensure compliance with healthcare regulations in your jurisdiction.

## Disclaimer

This system is designed for educational purposes and should not be used for actual medical diagnosis or treatment decisions. Always consult qualified healthcare professionals for medical advice.

## Support

For issues or questions, please open a GitHub issue or contact the development team.
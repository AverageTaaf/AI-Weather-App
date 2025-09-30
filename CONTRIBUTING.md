# Contributing to SchedulePro

First off, thank you for considering contributing to SchedulePro! It's people like you that make SchedulePro such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to montaquim.tbm@gmail.com.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10, macOS 12.0]
 - Browser: [e.g. Chrome 96, Firefox 95]
 - Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions or features you've considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, commented code
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Ensure your code follows the existing style**
6. **Write a clear commit message**

#### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the version numbers following [SemVer](http://semver.org/)
3. The PR will be merged once you have the sign-off of the maintainer

#### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran to verify your changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes on multiple browsers
```

## Development Setup

### Prerequisites
- Modern web browser
- Text editor or IDE (VS Code recommended)
- Git
- Basic knowledge of HTML, CSS, JavaScript

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/schedulepro.git
   cd schedulepro
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Edit the files as needed
   - Test in multiple browsers

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**

## Style Guidelines

### JavaScript Style Guide

- Use ES6+ features where appropriate
- Use `const` and `let` instead of `var`
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await for asynchronous operations

**Example:**
```javascript
// Good
async function loadUserTasks(userId) {
  try {
    const tasks = await db.collection('tasks').where('userId', '==', userId).get();
    return tasks.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error loading tasks:', error);
    throw error;
  }
}

// Bad
function loadUserTasks(userId) {
  var tasks;
  db.collection('tasks').where('userId', '==', userId).get().then(function(snapshot) {
    tasks = snapshot.docs.map(function(doc) {
      return { id: doc.id, ...doc.data() };
    });
  });
  return tasks; // This won't work!
}
```

### CSS Style Guide

- Use CSS variables for colors and common values
- Follow BEM naming convention where applicable
- Keep selectors specific but not overly complex
- Group related properties together
- Add comments for complex styles

**Example:**
```css
/* Good */
.task-card {
  background-color: var(--card);
  border-radius: var(--border-radius);
  padding: 20px;
  transition: var(--transition);
}

.task-card__title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}

/* Bad */
.task-card {
  background-color: #ffffff;
  padding: 20px;
  font-size: 1.2rem;
  border-radius: 16px;
  color: #2d3436;
  font-weight: 700;
  transition: all 0.3s ease;
}
```

### HTML Style Guide

- Use semantic HTML5 elements
- Keep markup clean and well-indented
- Add appropriate ARIA labels for accessibility
- Use meaningful class names

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

**Commit Message Format:**
```
Type: Brief description

Detailed explanation if needed

Fixes #123
```

**Types:**
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Update existing feature
- `Remove:` Remove feature/code
- `Refactor:` Code refactoring
- `Docs:` Documentation changes
- `Style:` Code style changes (formatting, etc.)
- `Test:` Adding or updating tests

## Testing Guidelines

Before submitting a PR, please test:

1. **Functionality**: Does your change work as expected?
2. **Browser Compatibility**: Test on Chrome, Firefox, Safari, Edge
3. **Responsive Design**: Test on different screen sizes
4. **Existing Features**: Ensure you didn't break anything
5. **Performance**: Check for any performance issues
6. **Console Errors**: No errors in browser console

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments for new functions
- Update inline comments if you change logic
- Create/update user guides if needed

## Questions?

Feel free to reach out:
- **Email**: montaquim.tbm@gmail.com
- **GitHub Issues**: For technical questions
- **GitHub Discussions**: For general questions

## Recognition

Contributors will be recognized in:
- README.md acknowledgments section
- Release notes
- Project documentation

Thank you for contributing to SchedulePro! 🎉

---

**Maintainer:** Taafeef Bin Montaquim
- Email: montaquim.tbm@gmail.com
- GitHub: [@AverageTaaf](https://github.com/AverageTaaf)

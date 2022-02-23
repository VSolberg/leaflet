
class LogParser {

    generateTimestampComponent (log) {
        return {
            value: log,
            type: 'Timestamp',
            label: 'Timestamp'
        }
    }

    generateCustomComponent (log) {
        const split = log.split('{')[0]
        const label = split.substr(0, split.length)

        return {
            value: log,
            type: 'Custom',
            label: label
        }
    }

    generateLoggerComponent (log) {
        return {
            value: log,
            type: 'Logger',
            label: 'Logger'
        }
    }

    generateLogLevelComponent (log) {
        return {
            value: log,
            type: 'LogLevel',
            label: 'Level'
        }
    }

    generateMessageComponent (log) {
        return {
            value: log,
            type: 'Message',
            label: 'Message'
        }
    }

    generateLogComponent (log, pattern) {
        if (pattern.contains('%d'))
            return this.generateTimestampComponent(log)
        if (pattern.contains('%X'))
            return this.generateCustomComponent(log)
        if (pattern.contains('%logger'))
            return this.generateLoggerComponent(log)
        if (pattern.contains('%level'))
            return this.generateLogLevelComponent(log)
        if (pattern.contains('%msg'))
            return this.generateMessageComponent(log)
    }

    parseLogLine (line, pattern) {
        const parsedPattern = pattern.split('|')
        const parsedLine = line.split('|')
        const parseMapping = []
        const components = []

        for(let i = 0; i < parsedLine.length; i++) {
            parseMapping[parsedLine[i]] = parsedPattern[i]
        }

        parseMapping.forEach((key, value) => {
            components.push(this.generateLogComponent(key, value))
        })
    }

}

export default new LogParser()
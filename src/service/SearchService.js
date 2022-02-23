const randomPrimeNumber = 101;

class SearchService {

    search(query, items) {
        const queryLength = query.length
        const filterHash = this.hash(query)
        const result = []

        items.forEach(item => {
            const itemLength = item.length
            for (let i = 0; i < itemLength - queryLength; i++) {
                const currentSlice = item.substr(i, queryLength)
                const currentSliceHash = this.hash(currentSlice)

                if (currentSliceHash === filterHash && this.isCharacterMatch(query, currentSlice)) {
                    const resultLine = item.substr(0, i) + '<div class="query-match">' + currentSlice + '</div>' + item.substr(i + queryLength, item.length - i + queryLength)
                    result.push(resultLine)
                }
            }
        })

        return result
    }

    hash(input) {
        let numericInputValue = 0

        for (let i = 0; i < input.length; i++) {
            numericInputValue += (input.charCodeAt(i) * randomPrimeNumber)
        }

        return numericInputValue;
    }

    isCharacterMatch(first, second) {
        return first === second
    }
}

export default new SearchService()
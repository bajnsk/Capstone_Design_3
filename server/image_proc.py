import easyocr
from sentence_splitter import SentenceSplitter


class ImageProcessor:
    def __init__(self, lang="en"):
        self.reader = easyocr.Reader([lang])
        self.splitter = SentenceSplitter(language=lang)

    def run_ocr(self, image):
        """
        run easy ocr and extract language and location

        :param image: image_path
        :return: coordinate, English text, probability
        [
            (
                [
                    [448, 54], [572, 54], [572, 86], [448, 86]
                ],
                'Abstract',
                0.9999912334395931
            ),
            ...
        ]
        """
        result = self.reader.readtext(image)
        return result

    def combine_text(self, read_text):
        """
        detected text is row-by-row which is not a complete sentence.
        it may reduce translating quality.
        so, it needs to split sentence by sentence.
        before split that, combine all together

        :param read_text: only allow for return of run_ocr
        :return: total_sentence
        """
        total_text = ""

        for element in read_text:
            coordinate, text, prob = element
            total_text += (text+' ')

        return total_text

    def sentence_split(self, total_text):
        """
        split dummy text with sentence spliter

        :param total_text: return of _combin_text func
        :return: sentences
        """

        sentences = self.splitter.split(text=total_text)

        return sentences

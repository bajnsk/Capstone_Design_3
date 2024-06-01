import easyocr
from sentence_splitter import SentenceSplitter
from PIL import Image, ImageFont, ImageDraw


class ImageProcessor:
    def __init__(self, lang="en", font_path='../font/NanumGothic.ttf'):
        self.reader = easyocr.Reader([lang])
        self.splitter = SentenceSplitter(language=lang)
        self.font_path = font_path

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

    def calc_fontsize(self, arrays):
        """
        return font_size based on y point

        :param arrays: [[x1, y1],[x2, y1],[x2, y2],[x1, y2]]
        :return: scaled font_size integer
        """
        point1, point2, point3, point4 = arrays
        y1, y2 = point1[-1], point3[-1]

        return int((y2-y1) * 0.7)

    def paste_text(self, out_img, arrays, translated_text):
        font_size = self.calc_fontsize(arrays)
        point1, point2, point3, point4 = arrays
        out_img.rectangle([point1[0], point1[1], point3[0], point3[1]], fill='white')
        out_img.text(xy=(point1[0], point1[1]), text=translated_text, fill=(0, 0, 0),
                     font=ImageFont.truetype(font=self.font_path, size=font_size))

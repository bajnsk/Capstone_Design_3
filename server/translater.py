from transformers import AutoTokenizer, AutoModelForSeq2SeqLM


class Model:
    def __init__(
            self,
            model_name='dhtocks/nllb-200-distilled-350M_en-ko',
            num_beams=5,
            device='cpu'
    ):
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name, forced_bos_token_id=256098)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name, src_lang='eng_Latn', tgt_lang='kor_Hang')
        self.num_beams = num_beams

    def gen(self, inputs):
        inputs = self.tokenizer('[YOUR_INPUT]', return_tensors="pt")
        output = self.model.generate(
            **inputs,
            # num_beams=self.num_beams
        )
        output = (self.tokenizer.decode(output[0]))
        return output

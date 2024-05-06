from transformers import AutoTokenizer, AutoModelForSeq2SeqLM


class Model:
    def __init__(
            self,
            model_name='dhtocks/nllb-200-distilled-350M_en-ko',
            num_beams=5,
            device='cpu'
    ):
        """

        :param model_name: huggingface model name
        :param num_beams: beam search N (more n, more running time)
        :param device: you can select device 'cpu' or 'cuda'
        """

        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name, forced_bos_token_id=256098)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name, src_lang='eng_Latn', tgt_lang='kor_Hang')
        self.num_beams = num_beams
        self.device = device
        self.model.to(device)

    def gen(self, inputs):
        inputs = self.tokenizer(inputs, return_tensors="pt").to(self.device)
        output = self.model.generate(
            **inputs,
            # num_beams=self.num_beams
        )
        output = (self.tokenizer.decode(output[0][2:-1]))
        return output


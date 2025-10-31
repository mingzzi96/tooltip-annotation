<template>
  <div id="hello">
    <h1>PANZOOM * CANVAS</h1>
    <div class="image_canvas_wrap">
      <canvas ref="image_canvas" class="image_canvas"></canvas>
    </div>
    <div ref="annotation_input" class="annotation_input">
      <textarea
        type="text"
        name="annotation"
        id="annotation"
        placeholder="코맨트를 입력해 주세요."
      />
      <div class="button_group">
        <button type="button">삭제</button>
        <button type="button">취소</button>
        <button type="button">저장</button>
      </div>
    </div>
  </div>
</template>

<script>
import Canvas from "@/model/Canvas";
import Panzoom from "@panzoom/panzoom";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {};
  },
  mounted() {
    this.canvas = new Canvas();
    this.canvas.imgLoad("/test-image.jpg", this.$refs.annotation_input);

    this.panzoom = new Panzoom(this.$refs.image_canvas, {
      cursor: "default",
      contain: "outside",
      minScale: 1,
      maxScale: 10,
    });
    this.$refs.image_canvas.addEventListener(
      "wheel",
      this.panzoom.zoomWithWheel
    );
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#hello {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.image_canvas_wrap {
  width: 90%;
  height: 50%;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
